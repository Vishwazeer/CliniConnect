import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id, patientId: session.user.id },
    include: {
      doctor: {
        select: { name: true, email: true, doctorProfile: true }
      }
    }
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ appointment });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status === 'CANCELLED') {
    const updated = await prisma.appointment.update({
      where: { id, patientId: session.user.id },
      data: { status: 'CANCELLED', cancellationReason: body.reason || 'Cancelled by patient' }
    });
    // Todo: enqueue cancellation emails
    return NextResponse.json({ appointment: updated });
  }

  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
}
