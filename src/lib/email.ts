import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function enqueueEmail(payload: EmailPayload) {
  await prisma.jobQueue.create({
    data: {
      type: "EMAIL",
      payload: payload as any,
      status: "PENDING",
    },
  });
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"CliniConnect" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

// --- Email Templates ---

export function bookingConfirmationEmail(data: {
  patientName: string;
  doctorName: string;
  specialisation: string;
  date: string;
  time: string;
}): EmailPayload {
  return {
    to: "",
    subject: "Appointment Confirmed",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #0d9488; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">✅ Appointment Confirmed</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p>Hi <strong>${data.patientName}</strong>,</p>
          <p>Your appointment has been confirmed:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #64748b;">Doctor</td><td style="padding: 8px 0; font-weight: 600;">Dr. ${data.doctorName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Specialisation</td><td style="padding: 8px 0;">${data.specialisation}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600;">${data.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0; font-weight: 600;">${data.time}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">A calendar event has been added to your Google Calendar.</p>
        </div>
      </div>
    `,
  };
}

export function appointmentReminderEmail(data: {
  name: string;
  doctorName: string;
  date: string;
  time: string;
}): EmailPayload {
  return {
    to: "",
    subject: "Appointment Reminder - Tomorrow",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #2563eb; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">🔔 Appointment Reminder</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p>Hi <strong>${data.name}</strong>,</p>
          <p>This is a reminder about your appointment tomorrow:</p>
          <p style="font-size: 18px; font-weight: 600; color: #0d9488;">${data.date} at ${data.time}</p>
          <p>With Dr. ${data.doctorName}</p>
        </div>
      </div>
    `,
  };
}

export function cancellationEmail(data: {
  name: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
}): EmailPayload {
  return {
    to: "",
    subject: "Appointment Cancelled",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #dc2626; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">❌ Appointment Cancelled</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p>Hi <strong>${data.name}</strong>,</p>
          <p>Your appointment with Dr. ${data.doctorName} on ${data.date} at ${data.time} has been cancelled.</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p>Please rebook at your convenience.</p>
        </div>
      </div>
    `,
  };
}

export function postVisitSummaryEmail(data: {
  patientName: string;
  doctorName: string;
  summary: string;
  date: string;
}): EmailPayload {
  return {
    to: "",
    subject: "Your Visit Summary",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #0d9488; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">📋 Your Visit Summary</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p>Hi <strong>${data.patientName}</strong>,</p>
          <p>Here is a summary of your visit with Dr. ${data.doctorName} on ${data.date}:</p>
          <div style="background: #f0fdfa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${data.summary}
          </div>
          <p style="color: #64748b; font-size: 14px;">Log in to view full details including medication schedule and follow-up steps.</p>
        </div>
      </div>
    `,
  };
}

export function medicationReminderEmail(data: {
  patientName: string;
  medicationName: string;
  dosage: string;
  instructions: string;
}): EmailPayload {
  return {
    to: "",
    subject: `Medication Reminder: ${data.medicationName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #7c3aed; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">💊 Medication Reminder</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p>Hi <strong>${data.patientName}</strong>,</p>
          <p>Time to take your medication:</p>
          <div style="background: #f5f3ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">${data.medicationName}</p>
            <p style="margin: 4px 0; color: #64748b;">Dosage: ${data.dosage}</p>
            <p style="margin: 4px 0; color: #64748b;">Instructions: ${data.instructions}</p>
          </div>
        </div>
      </div>
    `,
  };
}
