import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: resolvedParams.id },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true, image: true } }
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (appointment.doctorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (appointment.doctorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['HELD', 'BOOKED'].includes(appointment.status)) {
      return NextResponse.json({ error: 'Cannot cancel this appointment' }, { status: 400 });
    }

    const { reason } = await req.json();

    const updated = await prisma.appointment.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by doctor',
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
