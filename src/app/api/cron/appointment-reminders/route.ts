import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentReminderEmail, enqueueEmail } from "@/lib/email";
import { format, addDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    // Find all BOOKED appointments for tomorrow
    const appointments = await prisma.appointment.findMany({
      where: {
        date: new Date(tomorrowStr),
        status: "BOOKED",
      },
      include: {
        patient: true,
        doctor: {
          include: { doctorProfile: true },
        },
      },
    });

    let remindersEnqueued = 0;

    for (const appt of appointments) {
      // Reminder for patient
      const patientEmail = appointmentReminderEmail({
        name: appt.patient.name,
        doctorName: appt.doctor.name,
        date: format(appt.date, "MMMM d, yyyy"),
        time: appt.startTime,
      });
      patientEmail.to = appt.patient.email;
      await enqueueEmail(patientEmail);

      // Reminder for doctor
      const doctorEmail = appointmentReminderEmail({
        name: appt.doctor.name,
        doctorName: appt.patient.name,
        date: format(appt.date, "MMMM d, yyyy"),
        time: appt.startTime,
      });
      doctorEmail.to = appt.doctor.email;
      doctorEmail.subject = "Appointment Reminder - Tomorrow (Patient)";
      await enqueueEmail(doctorEmail);

      remindersEnqueued += 2;
    }

    return NextResponse.json({
      appointmentsFound: appointments.length,
      remindersEnqueued,
    });
  } catch (error) {
    console.error("Cron appointment-reminders error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
