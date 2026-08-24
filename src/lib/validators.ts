import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const doctorProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  specialisation: z.string().min(2),
  qualifications: z.string().min(2),
  bio: z.string().optional(),
  workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  slotDurationMinutes: z.number().min(10).max(120).default(30),
});

export const leaveSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD")),
});

export const symptomSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in detail (at least 10 characters)"),
});

export const bookingSchema = z.object({
  doctorId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
});

export const postVisitNotesSchema = z.object({
  doctorNotes: z.string().min(10, "Notes must be at least 10 characters"),
  prescription: z.string().min(5, "Prescription is required"),
});

export const preferredReminderTimeSchema = z.object({
  times: z.array(z.object({
    time: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
    label: z.string().optional(),
  })).min(1, "At least one reminder time required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;
export type LeaveInput = z.infer<typeof leaveSchema>;
export type SymptomInput = z.infer<typeof symptomSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PostVisitNotesInput = z.infer<typeof postVisitNotesSchema>;
