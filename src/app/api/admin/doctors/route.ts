import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctorProfile: true }
    });
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, specialisation, qualifications, bio, workingHoursStart, workingHoursEnd, slotDurationMinutes } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'DOCTOR',
          phone,
        }
      });

      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialisation,
          qualifications,
          bio,
          workingHoursStart,
          workingHoursEnd,
          slotDurationMinutes
        }
      });

      return user;
    });

    return NextResponse.json(newDoctor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create doctor' }, { status: 500 });
  }
}
