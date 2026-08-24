import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Stub for reminders
  const reminders = [
    { id: 1, medication: 'Amoxicillin', dosage: '500mg', time: '08:00' },
    { id: 2, medication: 'Vitamin D', dosage: '1000 IU', time: '09:00' }
  ];

  return NextResponse.json({ reminders });
}
