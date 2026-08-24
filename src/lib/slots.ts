import { addMinutes, parse, format, isBefore, isEqual } from "date-fns";
import { prisma } from "./prisma";

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export async function generateAvailableSlots(
  doctorId: string,
  dateStr: string
): Promise<TimeSlot[]> {
  // Get doctor profile
  const profile = await prisma.doctorProfile.findFirst({
    where: { user: { id: doctorId } },
  });

  if (!profile) return [];

  // Check if date is a leave day
  let leaveDays: string[] = [];
  try {
    leaveDays = typeof profile.leaveDays === 'string' ? JSON.parse(profile.leaveDays) : (profile.leaveDays as string[]) || [];
  } catch (e) {
    console.error("Failed to parse leave days", e);
  }
  if (leaveDays.includes(dateStr)) return [];

  const { workingHoursStart, workingHoursEnd, slotDurationMinutes } = profile;

  // Generate all possible slots
  const baseDate = new Date(`${dateStr}T00:00:00`);
  const startParts = workingHoursStart.split(":").map(Number);
  const endParts = workingHoursEnd.split(":").map(Number);

  let currentStart = new Date(baseDate);
  currentStart.setHours(startParts[0], startParts[1], 0, 0);

  const endOfDay = new Date(baseDate);
  endOfDay.setHours(endParts[0], endParts[1], 0, 0);

  const allSlots: TimeSlot[] = [];

  while (isBefore(currentStart, endOfDay) || isEqual(currentStart, endOfDay)) {
    const slotEnd = addMinutes(currentStart, slotDurationMinutes);
    if (isBefore(endOfDay, slotEnd)) break;

    allSlots.push({
      startTime: format(currentStart, "HH:mm"),
      endTime: format(slotEnd, "HH:mm"),
      available: true,
    });

    currentStart = slotEnd;
  }

  // Get existing booked/held appointments for this doctor + date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: new Date(dateStr),
      status: { in: ["BOOKED", "HELD"] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(existingAppointments.map((a) => a.startTime));

  // Mark unavailable slots
  return allSlots.map((slot) => ({
    ...slot,
    available: !bookedTimes.has(slot.startTime),
  }));
}

export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const start = new Date(2000, 0, 1, hours, minutes);
  const end = addMinutes(start, durationMinutes);
  return format(end, "HH:mm");
}
