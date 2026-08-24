import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const specialisation = searchParams.get('specialisation');

  const doctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      doctorProfile: specialisation ? {
        specialisation: {
          contains: specialisation
        }
      } : undefined
    },
    include: { 
      doctorProfile: true
    }
  });

  return NextResponse.json({ doctors });
}
