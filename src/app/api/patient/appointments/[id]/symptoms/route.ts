import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generatePreVisitSummary } from '@/lib/llm';
import { getUserAccessToken, createCalendarEvent } from '@/lib/calendar';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { symptoms, duration, severity, currentMeds } = await req.json();

    const apt = await prisma.appointment.findUnique({ where: { id, patientId: session.user.id } });
    if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

    const updated = await prisma.appointment.update({
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

    try {
      const token = await getUserAccessToken(session.user.id);
      if (token) {
        const startISO = new Date(updated.date.toISOString().split('T')[0] + 'T' + updated.startTime + ':00').toISOString();
        const endISO = new Date(updated.date.toISOString().split('T')[0] + 'T' + updated.endTime + ':00').toISOString();
        
        const doctorUser = await prisma.user.findUnique({
          where: { id: updated.doctorId },
          select: { name: true }
        });
        const doctorName = doctorUser?.name || updated.doctorId;

        const eventId = await createCalendarEvent(token, {
          summary: `Appointment with Dr. ${doctorName}`,
          description: `Chief Complaint: ${updated.preVisitSummary || ''}`,
          startDateTime: startISO,
          endDateTime: endISO
        });
        if (eventId) {
          await prisma.appointment.update({
            where: { id: updated.id },
            data: { calendarEventIdPatient: eventId }
          });
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
