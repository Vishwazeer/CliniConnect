import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.jobQueue.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.preferredReminderTime.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@healthcare.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "9999999999",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create Doctors
  const doctors = await Promise.all([
    prisma.user.create({
      data: {
        name: "Dr. Sarah Patel",
        email: "sarah.patel@healthcare.com",
        password: hashedPassword,
        role: "DOCTOR",
        phone: "9876543210",
        doctorProfile: {
          create: {
            specialisation: "General Medicine",
            qualifications: "MBBS, MD (Internal Medicine)",
            bio: "Experienced general physician with 10+ years of practice. Specializes in preventive care and chronic disease management.",
            workingHoursStart: "09:00",
            workingHoursEnd: "17:00",
            slotDurationMinutes: 30,
            leaveDays: "[]",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@healthcare.com",
        password: hashedPassword,
        role: "DOCTOR",
        phone: "9876543211",
        doctorProfile: {
          create: {
            specialisation: "Cardiology",
            qualifications: "MBBS, DM (Cardiology)",
            bio: "Board-certified cardiologist specializing in heart disease prevention and interventional cardiology.",
            workingHoursStart: "10:00",
            workingHoursEnd: "18:00",
            slotDurationMinutes: 45,
            leaveDays: "[]",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Priya Sharma",
        email: "priya.sharma@healthcare.com",
        password: hashedPassword,
        role: "DOCTOR",
        phone: "9876543212",
        doctorProfile: {
          create: {
            specialisation: "Dermatology",
            qualifications: "MBBS, MD (Dermatology)",
            bio: "Expert dermatologist treating skin conditions, allergies, and cosmetic concerns with 8 years of experience.",
            workingHoursStart: "09:30",
            workingHoursEnd: "16:30",
            slotDurationMinutes: 20,
            leaveDays: "[]",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Amit Desai",
        email: "amit.desai@healthcare.com",
        password: hashedPassword,
        role: "DOCTOR",
        phone: "9876543213",
        doctorProfile: {
          create: {
            specialisation: "Orthopedics",
            qualifications: "MBBS, MS (Orthopedics)",
            bio: "Orthopedic surgeon specializing in joint replacements, sports injuries, and spine disorders.",
            workingHoursStart: "08:00",
            workingHoursEnd: "15:00",
            slotDurationMinutes: 30,
            leaveDays: "[]",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Meera Nair",
        email: "meera.nair@healthcare.com",
        password: hashedPassword,
        role: "DOCTOR",
        phone: "9876543214",
        doctorProfile: {
          create: {
            specialisation: "Pediatrics",
            qualifications: "MBBS, MD (Pediatrics)",
            bio: "Caring pediatrician with expertise in newborn care, vaccinations, and childhood developmental disorders.",
            workingHoursStart: "09:00",
            workingHoursEnd: "16:00",
            slotDurationMinutes: 30,
            leaveDays: "[]",
          },
        },
      },
    }),
  ]);
  console.log(`✅ ${doctors.length} doctors created`);

  // Create Patients
  const patients = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        role: "PATIENT",
        phone: "8765432100",
        preferredReminderTimes: {
          create: [
            { time: "08:00", label: "Morning" },
            { time: "20:00", label: "Evening" },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: hashedPassword,
        role: "PATIENT",
        phone: "8765432101",
        preferredReminderTimes: {
          create: [
            { time: "09:00", label: "Morning" },
            { time: "14:00", label: "Afternoon" },
            { time: "21:00", label: "Night" },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Ravi Verma",
        email: "ravi.verma@example.com",
        password: hashedPassword,
        role: "PATIENT",
        phone: "8765432102",
        preferredReminderTimes: {
          create: [
            { time: "07:30", label: "Morning" },
            { time: "19:30", label: "Evening" },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ ${patients.length} patients created`);

  console.log("\n📋 Demo Credentials (password: password123 for all):");
  console.log("   Admin:   admin@healthcare.com");
  console.log("   Doctor:  sarah.patel@healthcare.com");
  console.log("   Patient: john.doe@example.com");
  console.log("\n🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
