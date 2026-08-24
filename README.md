# CliniConnect - Healthcare Appointment & Follow-up Manager

A full-stack healthcare appointment platform with separate portals for patients, doctors, and admins. Features AI-powered symptom summaries, email notifications, Google Calendar integration, and medication reminders.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Auth | NextAuth.js v5 (Google OAuth + Credentials) |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Prisma |
| LLM | Google Gemini API (gemini-2.0-flash) |
| Email | Nodemailer + Gmail SMTP |
| Calendar | Google Calendar API (OAuth 2.0) |
| UI | Tailwind CSS |
| Background Jobs | Vercel Cron + DB Job Queue |
| Deploy | Vercel |

## Features

### Patient Portal
- Register and login (credentials or Google OAuth)
- Search doctors by specialisation
- Book appointments with real-time slot availability
- 5-minute slot hold mechanism during symptom submission
- Pre-visit AI summary (urgency level, chief complaint, suggested questions)
- Post-visit summary (patient-friendly diagnosis, medication schedule, follow-up steps)
- Configurable medication reminder times
- View appointment history

### Doctor Portal
- Dashboard with today's appointments and urgency indicators
- Pre-visit AI summaries for each appointment
- Post-visit notes and prescription submission
- AI-generated patient-friendly summaries from clinical notes

### Admin Portal
- Create and manage doctor profiles (specialisation, working hours, slot duration)
- Manage doctor leave days with automatic patient notification
- View all appointments and system statistics

### Notifications
- Email: booking confirmation, 24h reminder, cancellation, post-visit summary, medication reminders
- Google Calendar: events auto-created/updated/deleted on booking changes

## Setup Guide

### Prerequisites
- Node.js 18+
- PostgreSQL database (or free Neon account)
- Google Cloud Console project (for OAuth + Calendar API)
- Google Gemini API key
- Gmail account with App Password

### 1. Clone and Install

```bash
git clone <repo-url>
cd CliniConnect
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (run `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not regular password) |
| `CRON_SECRET` | Secret for Vercel Cron authentication |

### 3. Google OAuth & Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs: **Google Calendar API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`
8. Under **OAuth consent screen**, add scopes:
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/calendar`

### 4. Gmail App Password

1. Enable 2-Step Verification on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Copy to `GMAIL_APP_PASSWORD` in `.env`

### 5. Database Setup

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@healthcare.com | password123 |
| Doctor | sarah.patel@healthcare.com | password123 |
| Patient | john.doe@example.com | password123 |

## API Documentation

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register patient |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth handlers |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/doctors` | List all doctors |
| POST | `/api/admin/doctors` | Create doctor |
| GET | `/api/admin/doctors/[id]` | Get doctor |
| PUT | `/api/admin/doctors/[id]` | Update doctor |
| DELETE | `/api/admin/doctors/[id]` | Delete doctor |
| POST | `/api/admin/doctors/[id]/leave` | Add leave dates |
| DELETE | `/api/admin/doctors/[id]/leave` | Remove leave date |
| GET | `/api/admin/appointments` | List appointments |

### Patient

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patient/doctors?specialisation=X` | Search doctors |
| GET | `/api/patient/slots/[doctorId]?date=YYYY-MM-DD` | Get available slots |
| GET | `/api/patient/appointments?status=X` | List appointments |
| POST | `/api/patient/appointments` | Create slot hold |
| GET | `/api/patient/appointments/[id]` | Get appointment |
| PUT | `/api/patient/appointments/[id]` | Cancel appointment |
| POST | `/api/patient/appointments/[id]/symptoms` | Submit symptoms |
| GET | `/api/patient/reminders` | Get medication reminders |
| GET/PUT | `/api/patient/settings/reminders` | Manage reminder times |

### Doctor

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor/appointments?date=X&status=X` | List appointments |
| GET | `/api/doctor/appointments/[id]` | Get appointment |
| POST | `/api/doctor/appointments/[id]/notes` | Submit post-visit notes |

### Cron (Internal)

| Endpoint | Schedule | Purpose |
|---|---|---|
| `/api/cron/process-jobs` | Every minute | Email queue + hold cleanup |
| `/api/cron/appointment-reminders` | Daily 2:00 UTC | 24h appointment reminders |
| `/api/cron/medication-reminders` | Hourly | Medication reminders |

## Database Schema

### Models

- **User** — id, email, password, name, phone, role (PATIENT/DOCTOR/ADMIN)
- **DoctorProfile** — specialisation, qualifications, working hours, slot duration, leave days
- **Appointment** — patient/doctor link, date/time, status, symptoms, AI summaries, prescriptions
- **MedicationReminder** — medication details, frequency, next reminder time, active flag
- **PreferredReminderTime** — patient's preferred medication reminder times
- **JobQueue** — async job queue for emails with retry logic
- **Account/Session** — NextAuth models

### Key Constraints

- Unique index: `(doctorId, date, startTime, status)` — prevents double-booking
- Indexed: `(status, holdExpiresAt)` — fast expired hold cleanup
- Indexed: `(isActive, nextReminderAt)` — fast medication reminder queries

## LLM Prompts

### Pre-Visit Summary

```
Analyse these symptoms and return a JSON object with:
- urgencyLevel: "Low" | "Medium" | "High"
- chiefComplaint: brief string
- suggestedQuestions: array of 3 questions for the doctor
- summary: 2-3 sentence clinical summary

Symptoms: <patient symptoms>
```

### Post-Visit Summary

```
Convert clinical notes into a patient-friendly summary as JSON:
- summary: easy-to-understand explanation
- medicationSchedule: [{name, dosage, frequency, duration, instructions}]
- followUpSteps: string[]
- warnings: string[] (symptoms needing immediate attention)

Clinical notes: <doctor notes>
Prescription: <prescription>
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy
5. Update `NEXTAUTH_URL` to production URL
6. Update Google OAuth redirect URI to production callback URL

### Cron Jobs

Cron jobs are configured in `vercel.json` and auto-deploy with Vercel.

## License

MIT
