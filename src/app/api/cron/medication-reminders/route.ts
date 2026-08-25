import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { medicationReminderEmail, enqueueEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find active medication reminders due now
    const dueReminders = await prisma.medicationReminder.findMany({
      where: {
        isActive: true,
        nextReminderAt: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      include: {
        patient: {
          include: {
            preferredReminderTimes: true,
          },
        },
      },
      take: 50,
    });

    let remindersSent = 0;

    for (const reminder of dueReminders) {
      const patient = reminder.patient;

      // Enqueue reminder email
      const email = medicationReminderEmail({
        patientName: patient.name,
        medicationName: reminder.medicationName,
        dosage: reminder.dosage,
        instructions: reminder.instructions || "Take as directed",
      });
      email.to = patient.email;
      await enqueueEmail(email);

      // Calculate next reminder time based on frequency and patient preferences
      const nextTime = calculateNextReminderTime(
        reminder.frequency,
        patient.preferredReminderTimes.map((t) => t.time),
        now
      );

      if (nextTime && (!reminder.endDate || nextTime <= reminder.endDate)) {
        await prisma.medicationReminder.update({
          where: { id: reminder.id },
          data: { nextReminderAt: nextTime },
        });
      } else {
        // No more reminders needed
        await prisma.medicationReminder.update({
          where: { id: reminder.id },
          data: { isActive: false },
        });
      }

      remindersSent++;
    }

    return NextResponse.json({
      dueRemindersFound: dueReminders.length,
      remindersSent,
    });
  } catch (error) {
    console.error("Cron medication-reminders error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function calculateNextReminderTime(
  frequency: string,
  preferredTimes: string[],
  currentTime: Date
): Date | null {
  const freq = frequency.toLowerCase();
  const sortedTimes = preferredTimes.length > 0
    ? preferredTimes.sort()
    : ["08:00", "20:00"]; // Default if no preferences

  const now = new Date(currentTime);
  const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (freq.includes("once") || freq.includes("1x") || freq === "once daily") {
    // Once daily - use first preferred time tomorrow
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    const [h, m] = sortedTimes[0].split(":").map(Number);
    next.setHours(h, m, 0, 0);
    return next;
  }

  if (freq.includes("twice") || freq.includes("2x") || freq === "twice daily") {
    // Twice daily - find next preferred time
    const times = sortedTimes.slice(0, 2);
    if (times.length < 2) times.push("20:00");

    for (const time of times) {
      if (time > currentHHMM) {
        const next = new Date(now);
        const [h, m] = time.split(":").map(Number);
        next.setHours(h, m, 0, 0);
        return next;
      }
    }
    // All times today passed, use first time tomorrow
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    const [h, m] = times[0].split(":").map(Number);
    next.setHours(h, m, 0, 0);
    return next;
  }

  if (freq.includes("three") || freq.includes("3x") || freq === "thrice daily") {
    // Three times daily
    const times = sortedTimes.slice(0, 3);
    while (times.length < 3) times.push("14:00");

    for (const time of times) {
      if (time > currentHHMM) {
        const next = new Date(now);
        const [h, m] = time.split(":").map(Number);
        next.setHours(h, m, 0, 0);
        return next;
      }
    }
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    const [h, m] = times[0].split(":").map(Number);
    next.setHours(h, m, 0, 0);
    return next;
  }

  // Default: once daily at first preferred time
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  const [h, m] = sortedTimes[0].split(":").map(Number);
  next.setHours(h, m, 0, 0);
  return next;
}
