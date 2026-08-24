import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = { patientId: session.user.id };
  if (status) where.status = status;
  else where.status = { not: 'HELD' };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      doctor: {
        select: { name: true, email: true }
      }
    },
    orderBy: { date: 'asc' }
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { doctorId, date, startTime } = await req.json();

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });
    const duration = doctorProfile?.slotDurationMinutes || 30;

    const [hours, minutes] = startTime.split(':').map(Number);
    const startObj = new Date(2000, 0, 1, hours, minutes);
    startObj.setMinutes(startObj.getMinutes() + duration);
    const endTime = `${String(startObj.getHours()).padStart(2, '0')}:${String(startObj.getMinutes()).padStart(2, '0')}`;
    
    const holdExpiresAt = new Date();
    holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 5);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        doctorId,
        date: new Date(date),
        startTime,
        endTime,
        status: 'HELD',
        holdExpiresAt
      }
    });

    return NextResponse.json({ appointmentId: appointment.id });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Slot already taken' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to hold appointment' }, { status: 500 });
  }
}
