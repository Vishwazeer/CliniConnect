import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let whereClause: any = { doctorId: session.user.id };

    if (date && date !== 'all') {
      if (date === 'today') {
        const targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0);
        whereClause.date = targetDate;
      } else if (date === 'upcoming') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause.date = { gte: today };
      } else {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        whereClause.date = targetDate;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true, email: true } }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
