import { google } from "googleapis";
import { prisma } from "./prisma";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
}

interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  recurrence?: string[]; // e.g. ['RRULE:FREQ=DAILY;UNTIL=20260901T235959Z']
  attendeeEmail?: string;
}

export async function getAuthenticatedCalendarClient(userId: string) {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
      },
    });

    if (!account || (!account.access_token && !account.refresh_token)) {
      return null;
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: account.access_token || undefined,
      refresh_token: account.refresh_token || undefined,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    const now = Date.now();
    const isExpired = account.expires_at ? (account.expires_at * 1000) < (now + 5 * 60 * 1000) : !account.access_token;

    if (isExpired && account.refresh_token) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        if (credentials.access_token) {
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: credentials.access_token,
              expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
            },
          });
          oauth2Client.setCredentials(credentials);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh Google OAuth token:", refreshErr);
      }
    }

    return google.calendar({ version: "v3", auth: oauth2Client });
  } catch (err) {
    console.error("Failed to initialize Google Calendar client:", err);
    return null;
  }
}

export async function createCalendarEventForUser(
  userId: string,
  data: CalendarEventData
): Promise<string | null> {
  try {
    const calendar = await getAuthenticatedCalendarClient(userId);
    if (!calendar) return null;

    const requestBody: any = {
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
          { method: "popup", minutes: 10 },
          { method: "email", minutes: 60 },
        ],
      },
    };

    if (data.recurrence && data.recurrence.length > 0) {
      requestBody.recurrence = data.recurrence;
    }

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody,
    });
    return event.data.id || null;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return null;
  }
}

export async function updateCalendarEventForUser(
  userId: string,
  eventId: string,
  data: Partial<CalendarEventData>
): Promise<boolean> {
  try {
    const calendar = await getAuthenticatedCalendarClient(userId);
    if (!calendar) return false;

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

export async function deleteCalendarEventForUser(
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = await getAuthenticatedCalendarClient(userId);
    if (!calendar) return false;

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

// Backward compatibility helpers
export async function createCalendarEvent(
  accessToken: string,
  data: CalendarEventData
): Promise<string | null> {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
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
    console.error("Failed to create calendar event with token:", error);
    return null;
  }
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  data: Partial<CalendarEventData>
): Promise<boolean> {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
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
    console.error("Failed to update calendar event with token:", error);
    return false;
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
    return true;
  } catch (error) {
    console.error("Failed to delete calendar event with token:", error);
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

