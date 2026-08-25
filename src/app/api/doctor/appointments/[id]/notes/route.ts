import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { enqueueEmail, postVisitSummaryEmail } from '@/lib/email';
import { updateCalendarEventForUser } from '@/lib/calendar';

const postVisitNotesSchema = z.object({
  doctorNotes: z.string().min(1),
  prescription: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = postVisitNotesSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const { doctorNotes, prescription } = validatedData.data;

    const appointment = await prisma.appointment.findUnique({
      where: { id: resolvedParams.id },
      include: {
        patient: { include: { preferredReminderTimes: true } },
      }
    });

    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (appointment.doctorId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (appointment.status !== 'BOOKED') return NextResponse.json({ error: 'Appointment is not BOOKED' }, { status: 400 });

    let postVisitSummary = null;
    let medicationsToRemind: any[] = [];
    
    try {
      const { generatePostVisitSummary } = await import('@/lib/llm');
      const llmResult = await generatePostVisitSummary(doctorNotes, prescription);
      if (llmResult) {
        postVisitSummary = llmResult.summary;
        if (llmResult.medicationSchedule) {
           medicationsToRemind = llmResult.medicationSchedule;
        }
      }
    } catch (llmError) {
      console.warn("LLM summary generation failed or module not found", llmError);
    }

    const updatedApt = await prisma.appointment.update({
      where: { id: resolvedParams.id },
      data: {
        doctorNotes,
        prescription,
        status: 'COMPLETED',
        postVisitSummary,
      },
    });

    // Sync notes & prescription to patient's Google Calendar event if it exists
    try {
      if (appointment.calendarEventIdPatient) {
        const description = `Chief Complaint: ${appointment.preVisitSummary || ''}\n\nClinical Notes:\n${doctorNotes}\n\nPrescription:\n${prescription}`;
        await updateCalendarEventForUser(appointment.patientId, appointment.calendarEventIdPatient, {
          description
        });
      }
    } catch (calendarError) {
      console.error("Failed to update Google Calendar event description:", calendarError);
    }

    // Create medication reminders if parsed
    if (medicationsToRemind && medicationsToRemind.length > 0) {
       const hasReminderTimes = appointment.patient?.preferredReminderTimes && appointment.patient.preferredReminderTimes.length > 0;
       const prefTime = hasReminderTimes ? appointment.patient.preferredReminderTimes[0] : { time: "08:00" }; 
       const [h, m] = prefTime.time.split(':').map(Number);
       let nextReminder = new Date();
       nextReminder.setHours(h, m, 0, 0);
       if (nextReminder < new Date()) {
          nextReminder.setDate(nextReminder.getDate() + 1);
       }

       for (const med of medicationsToRemind) {
          try {
             await prisma.medicationReminder.create({
                data: {
                   appointmentId: appointment.id,
                   patientId: appointment.patientId,
                   medicationName: med.name,
                   dosage: med.dosage,
                   frequency: med.frequency || 'once daily',
                   instructions: med.instructions || '',
                   startDate: new Date(),
                   endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                   nextReminderAt: nextReminder,
                   isActive: true
                }
             });
          } catch(e) { console.error("Failed to create reminder", e) }
       }
    }

    // Send post-visit summary email
    if (appointment.patient?.email) {
      try {
        const email = postVisitSummaryEmail({
          patientName: appointment.patient.name,
          doctorName: session.user.name,
          summary: postVisitSummary || 'No summary generated.',
          date: appointment.date.toLocaleDateString(),
        });
        email.to = appointment.patient.email;
        await enqueueEmail(email);
      } catch(e) {
        console.error("Failed to enqueue email", e);
      }
    }

    return NextResponse.json(updatedApt);
  } catch (error) {
    console.error('Error saving notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
