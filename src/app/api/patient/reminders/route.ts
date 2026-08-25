import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getUserAccessToken, createCalendarEvent } from '@/lib/calendar';

function parseDateSafely(input: any, fallback: Date | null = null): Date | null {
  if (!input) return fallback;
  if (input instanceof Date) return isNaN(input.getTime()) ? fallback : input;
  const str = String(input).trim();
  if (!str) return fallback;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const cd = new Date(year, month, day);
      if (!isNaN(cd.getTime())) return cd;
    }
    if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const cd = new Date(year, month, day);
      if (!isNaN(cd.getTime())) return cd;
    }
  }
  return fallback;
}

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

    const parsedStart = parseDateSafely(startDate, new Date())!;
    const parsedEnd = parseDateSafely(endDate, null);
    const parsedNext = parseDateSafely(nextReminderAt, parsedStart);

    const reminder = await prisma.medicationReminder.create({
      data: {
        patientId: session.user.id,
        medicationName: medicationName || 'Medication',
        dosage: dosage || 'As directed',
        frequency: frequency || 'Daily',
        instructions: instructions || null,
        startDate: parsedStart,
        endDate: parsedEnd,
        nextReminderAt: parsedNext,
        isActive: true
      }
    });

    try {
      const token = await getUserAccessToken(session.user.id);
      if (token) {
        const eventStart: Date = parsedNext || parsedStart || new Date();
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
    console.error("Failed to create reminder:", error);
    return NextResponse.json({ error: error.message || 'Failed to create reminder' }, { status: 500 });
  }
}
