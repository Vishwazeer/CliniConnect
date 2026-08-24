import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Stub fetching settings from db
  const times = [
    { time: '08:00', label: 'Morning' },
    { time: '20:00', label: 'Evening' }
  ];

  return NextResponse.json({ times });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { times } = await req.json();

  // Stub updating settings in db
  // await prisma.patientProfile.update(...)

  return NextResponse.json({ success: true, times });
}
