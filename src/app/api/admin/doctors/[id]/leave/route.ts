import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dates } = await req.json();
    if (!Array.isArray(dates)) return NextResponse.json({ error: 'Invalid dates format' }, { status: 400 });

    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: id } });
    if (!doctorProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    let existingLeaves: string[] = [];
    try {
      existingLeaves = typeof doctorProfile.leaveDays === 'string' 
        ? JSON.parse(doctorProfile.leaveDays) 
        : (doctorProfile.leaveDays as string[]) || [];
    } catch (e) {
      console.error("Failed to parse existing leaves", e);
    }

    const newLeaves = Array.from(new Set([...existingLeaves, ...dates]));

    await prisma.doctorProfile.update({
      where: { userId: id },
      data: { leaveDays: JSON.stringify(newLeaves) }
    });

    let affectedCount = 0;
    
    // Find booked appointments on these dates
    for (const date of dates) {
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: id,
          status: 'BOOKED',
          date: new Date(date)
        }
      });

      for (const apt of appointments) {
        await prisma.appointment.update({
          where: { id: apt.id },
          data: { status: 'CANCELLED', cancellationReason: 'Doctor on leave' }
        });
        
        await prisma.jobQueue.create({
          data: {
            type: 'EMAIL',
            payload: JSON.stringify({
              type: 'APPOINTMENT_CANCELLED',
              appointmentId: apt.id,
              reason: 'Doctor on leave'
            })
          }
        });
        affectedCount++;
      }
    }

    return NextResponse.json({ addedDates: dates, affectedAppointments: affectedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add leave' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { date } = await req.json();
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: id } });
    if (!doctorProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    let existingLeaves: string[] = [];
    try {
      existingLeaves = typeof doctorProfile.leaveDays === 'string' 
        ? JSON.parse(doctorProfile.leaveDays) 
        : (doctorProfile.leaveDays as string[]) || [];
    } catch (e) {
      console.error("Failed to parse existing leaves", e);
    }

    const newLeaves = existingLeaves.filter(d => d !== date);

    await prisma.doctorProfile.update({
      where: { userId: id },
      data: { leaveDays: JSON.stringify(newLeaves) }
    });

    return NextResponse.json({ success: true, removedDate: date });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove leave' }, { status: 500 });
  }
}
