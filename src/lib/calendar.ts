import { google } from "googleapis";
import { prisma } from "./prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
);

function getCalendarClient(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  attendeeEmail?: string;
}

export async function createCalendarEvent(
  accessToken: string,
  data: CalendarEventData
): Promise<string | null> {
  try {
    const calendar = getCalendarClient(accessToken);
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: data.startDateTime,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: data.endDateTime,
          timeZone: "Asia/Kolkata",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "email", minutes: 1440 },
          ],
        },
      },
    });
    return event.data.id || null;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return null;
  }
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  data: Partial<CalendarEventData>
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(accessToken);
    const updateBody: Record<string, unknown> = {};
    if (data.summary) updateBody.summary = data.summary;
    if (data.description) updateBody.description = data.description;
    if (data.startDateTime) {
      updateBody.start = {
        dateTime: data.startDateTime,
        timeZone: "Asia/Kolkata",
      };
    }
    if (data.endDateTime) {
      updateBody.end = {
        dateTime: data.endDateTime,
        timeZone: "Asia/Kolkata",
      };
    }
    await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: updateBody,
    });
    return true;
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return false;
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(accessToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}

export async function getUserAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });
  return account?.access_token || null;
}
