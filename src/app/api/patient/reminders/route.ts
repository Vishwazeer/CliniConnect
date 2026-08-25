import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getUserAccessToken, createCalendarEvent } from '@/lib/calendar';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const reminders = await prisma.medicationReminder.findMany({
    where: { patientId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ reminders });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { medicationName, dosage, frequency, instructions, startDate, endDate, nextReminderAt } = await req.json();

    const reminder = await prisma.medicationReminder.create({
      data: {
        patientId: session.user.id,
        medicationName,
        dosage,
        frequency,
        instructions,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextReminderAt: nextReminderAt ? new Date(nextReminderAt) : null,
        isActive: true
      }
    });

    try {
      const token = await getUserAccessToken(session.user.id);
      if (token) {
        let eventStart: Date;
        if (nextReminderAt) {
          eventStart = new Date(nextReminderAt);
        } else {
          eventStart = new Date(startDate);
          if (isNaN(eventStart.getTime())) {
            eventStart = new Date();
          }
        }
        const startDateTime = eventStart.toISOString();
        const endDateTime = new Date(eventStart.getTime() + 30 * 60 * 1000).toISOString();

        await createCalendarEvent(token, {
          summary: `Take Medication: ${medicationName} (${dosage})`,
          description: `Dosage: ${dosage}\nFrequency: ${frequency}\nInstructions: ${instructions || 'None'}`,
          startDateTime,
          endDateTime
        });
      }
    } catch (calendarError) {
      console.error("Failed to sync reminder to Google Calendar:", calendarError);
    }

    return NextResponse.json({ reminder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
