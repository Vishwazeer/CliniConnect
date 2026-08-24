import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generatePreVisitSummary } from '@/lib/llm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const fullSymptoms = `Symptoms: ${symptoms}\nDuration: ${duration}\nSeverity: ${severity}\nCurrent Meds: ${currentMeds}`;

  let preVisitSummary = "Symptoms recorded. AI summary generation failed.";
  let urgencyLevel = severity === 'severe' ? 'HIGH' : severity === 'moderate' ? 'MEDIUM' : 'LOW';
  let suggestedQuestions = "[]";

  try {
    const summaryResult = await generatePreVisitSummary(fullSymptoms);
    if (summaryResult) {
      preVisitSummary = summaryResult.summary;
      urgencyLevel = summaryResult.urgencyLevel.toUpperCase(); // LOW | MEDIUM | HIGH
      suggestedQuestions = JSON.stringify(summaryResult.suggestedQuestions);
    }
  } catch (llmError) {
    console.error("LLM Pre-Visit Summary failed:", llmError);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: 'BOOKED',
      symptoms: fullSymptoms,
      preVisitSummary,
      urgencyLevel,
      suggestedQuestions,
      holdExpiresAt: null
    }
  });

  // Todo: Enqueue confirmation emails
  // Todo: Calendar integration

  return NextResponse.json({ appointment: updated });
}
