import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generatePreVisitSummary } from '@/lib/llm';
import { createCalendarEventForUser } from '@/lib/calendar';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { symptoms, duration, severity, currentMeds } = await req.json();

    const apt = await prisma.appointment.findUnique({ where: { id } });
    if (!apt || apt.patientId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (apt.status === 'BOOKED') {
      return NextResponse.json({ appointment: apt });
    }
    if (apt.status !== 'HELD') return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    
    if (apt.holdExpiresAt && apt.holdExpiresAt < new Date()) {
      await prisma.appointment.delete({ where: { id } });
      return NextResponse.json({ error: 'Hold expired' }, { status: 410 });
    }

    const fullSymptoms = `Symptoms: ${symptoms}\nDuration: ${duration || 'Not specified'}\nSeverity: ${severity || 'mild'}\nCurrent Meds: ${currentMeds || 'None'}`;

    let preVisitSummary = 'Symptoms recorded successfully.';
    let urgencyLevel = severity === 'severe' ? 'HIGH' : severity === 'moderate' ? 'MEDIUM' : 'LOW';
    let suggestedQuestions: string[] = [];

    try {
      const summaryResult = await generatePreVisitSummary(fullSymptoms);
      if (summaryResult) {
        preVisitSummary = summaryResult.summary;
        const level = summaryResult.urgencyLevel.toUpperCase();
        if (['LOW', 'MEDIUM', 'HIGH'].includes(level)) {
          urgencyLevel = level;
        }
        suggestedQuestions = summaryResult.suggestedQuestions || [];
      }
    } catch (llmError) {
      console.error('LLM Pre-Visit Summary failed:', llmError);
      // Continue with defaults — appointment still gets booked
    }

    let updated;
    try {
      updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'BOOKED',
          symptoms: fullSymptoms,
          preVisitSummary,
          urgencyLevel: urgencyLevel as any,
          suggestedQuestions: suggestedQuestions as any,
          holdExpiresAt: null
        }
      });
    } catch (updateError: any) {
      console.error('Failed to update appointment to BOOKED:', updateError);
      if (updateError.code === 'P2002') {
        return NextResponse.json({ error: 'This time slot is already booked. Please choose another slot.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to confirm booking.' }, { status: 500 });
    }

    try {
      if (updated) {
        const appointmentDate = new Date(updated.date);
        const dateStr = !isNaN(appointmentDate.getTime()) ? appointmentDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const startISO = new Date(`${dateStr}T${updated.startTime}:00`).toISOString();
        const endISO = new Date(`${dateStr}T${updated.endTime}:00`).toISOString();
        
        const doctorUser = await prisma.user.findUnique({
          where: { id: updated.doctorId },
          select: { name: true }
        });
        const doctorName = doctorUser?.name || 'Doctor';

        const eventId = await createCalendarEventForUser(session.user.id, {
          summary: `Appointment with Dr. ${doctorName}`,
          description: `Chief Complaint: ${updated.preVisitSummary || ''}`,
          startDateTime: startISO,
          endDateTime: endISO
        });
        if (eventId) {
          await prisma.appointment.update({
            where: { id: updated.id },
            data: { calendarEventIdPatient: eventId }
          }).catch(e => console.error('Failed to save calendar event id:', e));
        }
      }
    } catch (calendarError) {
      console.error('Failed to sync appointment to Google Calendar:', calendarError);
    }

    return NextResponse.json({ appointment: updated });
  } catch (error: any) {
    console.error('Symptoms route error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
