import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
// import { generateAvailableSlots } from '@/lib/slots';

export async function GET(req: Request, { params }: { params: Promise<{ doctorId: string }> }) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { doctorId } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

  // Stub for slot generation
  const slots = [
    { startTime: '09:00', available: true },
    { startTime: '09:30', available: false },
    { startTime: '10:00', available: true },
    { startTime: '10:30', available: true },
    { startTime: '11:00', available: true },
    { startTime: '14:00', available: true },
  ];

  return NextResponse.json({ slots });
}
