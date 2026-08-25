# 🏥 CliniConnect - AI-Powered Healthcare Appointment & Follow-Up System

> **A Next-Generation Telehealth & Clinical Workflow Platform with Generative AI Triage, Two-Way Google Calendar Sync, and Intelligent Medication Adherence.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Google Calendar](https://img.shields.io/badge/Google_Calendar-API_v3-4285F4?style=for-the-badge&logo=google-calendar)](https://developers.google.com/calendar)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://cliniconnect-lilac.vercel.app/)

---

## 🌟 Executive Summary

**CliniConnect** bridges the gap between patients, healthcare providers, and clinical administrators. It solves core bottlenecks in modern outpatient care:
1. **Clinical Overload & Information Asymmetry**: Doctors spend valuable time extracting basic history. CliniConnect's AI pre-visit triage structures patient symptoms, assigns clinical urgency levels, and suggests diagnostic questions *before* the consultation begins.
2. **Double-Booking & Slot Contention**: A high-concurrency 5-minute atomic slot-holding engine prevents conflicting simultaneous bookings.
3. **Medication Non-Adherence & Lost Instructions**: Clinical notes and prescriptions are translated into plain-language summaries with automated daily multi-time medication reminders synced directly into the patient's personal Google Calendar.

---

## 📸 Visual Walkthrough & Portals

### 👤 1. Patient Portal

The patient experience is designed for rapid intake, instant provider discovery, and zero-friction follow-up adherence.

#### A. Secure Authentication & Onboarding
Seamless Google OAuth integration links patient identity with Google Calendar permissions to enable automated event synchronization.

![Google OAuth Sign-In](docs/screenshots/patient/Google%20auth%201.png)

#### B. Patient Dashboard
A unified command center showing upcoming consultations, active medication count, recent clinical reports, and quick navigation.

![Patient Dashboard](docs/screenshots/patient/Dashboard.png)

#### C. Doctor Discovery & Slot Booking
Patients can filter certified specialists, inspect doctor biographies and credentials, pick dates, and lock in available time slots in real time.

![Find Doctors & Real-Time Booking](docs/screenshots/patient/Find%20Doctors.png)

#### D. Appointment Tracking & Post-Visit Records
Patients can review scheduled, completed, or cancelled appointments and access AI-generated consultation summaries.

![My Appointments](docs/screenshots/patient/My%20Appointments.png)

#### E. Intelligent Medication Reminders (Multi-Time Daily Schedules)
Patients can manage active medications, configure flexible daily dosage schedules (e.g. 1x, 2x, 3x, 4x daily or custom times), and have recurring reminders pushed to Google Calendar.

![Medication Reminders](docs/screenshots/patient/Reminder.png)

#### F. Custom Reminder Preferences
Configure notification channels, quiet hours, and default daily intake windows (Morning, Afternoon, Evening, Night).

![Reminder Preferences](docs/screenshots/patient/Reminder%20Preference.png)

#### G. Automated Google Calendar Synchronization
Bookings, clinical notes, and recurring medication reminders automatically sync into Google Calendar with custom alert overrides (popup & email).

![Google Calendar Integration](docs/screenshots/patient/Calender%20appointments.png)

---

### 👨‍⚕️ 2. Doctor Portal

Built specifically for high-efficiency clinical practice, providing instant diagnostic context before entering any consultation.

#### A. Doctor Dashboard
A daily schedule overview showing today's patient queue, consultation metrics, urgent cases, and appointment breakdowns.

![Doctor Dashboard](docs/screenshots/doctor/Dr%20Dashboard.png)

#### B. Upcoming Consultations Schedule
Comprehensive schedule view allowing physicians to filter by upcoming appointments, today's schedule, or custom date ranges with color-coded urgency badges.

![Doctor Appointments Schedule](docs/screenshots/doctor/Dr.%20Appointments.png)

#### C. AI-Powered Pre-Visit Triage Summary
Before seeing the patient, the doctor views structured Chief Complaints, reported symptom timelines, current drug interactions, urgency status (High / Moderate / Normal), and AI-suggested clinical questions.

![Appointments with AI Summary](docs/screenshots/doctor/Appointments%20with%20AI%20summery.png)

#### D. Consultation & Clinical Record Formulation
Physicians enter diagnosis notes and prescriptions. Upon submission, the AI engine translates clinical jargon into patient-friendly summaries and parses medication schedules.

![Consultation Notes Formulation](docs/screenshots/doctor/Consultation.png)

![Completed Consultation Record](docs/screenshots/doctor/Consultation%20(2).png)

#### E. Physician Profile & Practice Schedule
Manage clinical specialisations, qualifications, working hours start/end, slot duration intervals (e.g. 15, 30, 45 mins), and leave dates.

![Doctor Profile Settings](docs/screenshots/doctor/Profile.png)

---

### 🛡️ 3. Admin Portal

Enables hospital administrators to oversee operations, onboard medical staff, manage physician availability, and audit appointments.

#### A. Administrative Command Center
Live statistics tracking total registered patients, onboarded doctors, completed consultations, and hospital-wide appointment volume.

![Admin Dashboard](docs/screenshots/admin/Admin%20Dashboard.png)

#### B. Doctor Directory & Management
Comprehensive roster of all medical staff, specialisations, contact numbers, and profile management tools.

![Admin Doctors Directory](docs/screenshots/admin/Admin%20Doctors.png)

#### C. Onboarding New Physicians
Create new doctor accounts, configure practice timings, qualifications, bio, and slot intervals.

![Add New Doctors](docs/screenshots/admin/Add%20new%20Drs..png)

#### D. Hospital-Wide Appointments Ledger
Complete oversight of all bookings across all medical departments with filtering by date and status.

![Admin Appointments Ledger](docs/screenshots/admin/Appointments%20Admin.png)

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Patient Flow
        A[Patient Books Slot] --> B[5-Minute Atomic Slot Hold]
        B --> C[Patient Submits Symptoms]
        C --> D[Google Gemini 2.0 AI Triage]
        D --> E[Status: BOOKED]
        E --> F[Google Calendar Event Inserted]
        E --> G[Confirmation Email Dispatched]
    end

    subgraph Doctor Flow
        E --> H[Doctor Views Pre-Visit AI Summary]
        H --> I[Doctor Conducts Consultation]
        I --> J[Doctor Enters Notes & Rx]
        J --> K[AI Generates Patient Summary & Med Schedule]
        K --> L[Status: COMPLETED]
        L --> M[Google Calendar Updated with Notes]
        L --> N[Medication Reminders Auto-Created]
    end

    subgraph Automation Flow
        N --> O[Vercel Cron & Job Queue]
        O --> P[Hourly/Daily Medication & Appt Alerts]
    end
```

---

## 🔑 Key Features & Technical Implementations

### 1. Pre-Visit AI Triage Engine
- **Model**: Google Gemini (`gemini-2.0-flash`)
- **Pipeline**: Ingests patient-reported chief symptoms, duration, and current medications.
- **Output**: JSON payload structured with `urgencyLevel`, `chiefComplaint`, `summary`, and targeted diagnostic questions for the physician.

### 2. Concurrency-Safe 5-Minute Slot Hold
- When a patient selects a time slot, the system creates a temporary `HELD` record with a 5-minute TTL (`holdExpiresAt`).
- Compound unique index `(doctorId, date, startTime, status)` ensures two patients cannot claim the same slot simultaneously.
- Background cron automatically cleans up expired unconfirmed holds.

### 3. Two-Way Google Calendar Integration
- Built with `@googleapis/calendar` and OAuth 2.0.
- Automatic **OAuth Token Refresh Engine** detects expired access tokens and refreshes them seamlessly in Neon DB via stored `refresh_token`.
- Uses RFC 5545 `RRULE:FREQ=DAILY;UNTIL=...` for recurring multi-time medication reminders throughout treatment duration.

### 4. Role-Based Access & Dynamic NextAuth v5
- Split Edge configuration (`auth.config.ts`) and Node runtime (`auth.ts`) to maintain Edge Middleware under **25 KB**.
- Strict role isolation across `/patient/*`, `/doctor/*`, and `/admin/*`.
- 1-click demo evaluation selector on login page for instant judge testing.

---

## 💻 Tech Stack & Tooling

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server & Client Components, Dynamic Routing |
| **Language** | TypeScript | Strict type safety across full stack |
| **Styling** | Tailwind CSS v4 | Responsive cyan/teal medical design system |
| **Authentication** | NextAuth.js v5 (Auth.js) | Google OAuth 2.0 + Credentials provider |
| **Database** | PostgreSQL (Neon Serverless) | Serverless PostgreSQL with pooling |
| **ORM** | Prisma ORM 6 | Schema migrations, type-safe queries, relation joins |
| **AI / LLM** | Google Gemini 2.0 Flash | Pre-visit triage & post-visit translation |
| **Calendar API** | Google Calendar API v3 | Automated events, recurrence, reminder overrides |
| **Email Service** | Nodemailer + Gmail SMTP | Transactional booking & reminder emails |
| **Task Scheduling** | Vercel Cron + DB Job Queue | Daily/hourly background reminder workers |
| **Hosting** | Vercel | Global Edge Network deployment |

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** or **yarn** / **pnpm**
- **PostgreSQL Database** (e.g. free Neon account)
- **Google Cloud Console Project** (with Google Calendar API & OAuth 2.0 enabled)
- **Google Gemini API Key**

### 1. Clone the Repository
```bash
git clone https://github.com/Vishwazeer/CliniConnect.git
cd CliniConnect/healthcare-app
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require"

# NextAuth v5
AUTH_SECRET="dad2a0ef1483c726c91b17d7f033050f417f9ad5a2d6b74989ef8fa9b7480076"
NEXTAUTH_SECRET="dad2a0ef1483c726c91b17d7f033050f417f9ad5a2d6b74989ef8fa9b7480076"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth & Calendar
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Email (Optional for local testing)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"

# Cron Security
CRON_SECRET="your-random-cron-secret-key"
```

### 3. Database Initialization & Seeding
```bash
# Push schema to database
npx prisma db push

# Seed demo doctors, patients, and admin
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials for Evaluators

Quick 1-click accounts ready for testing on the login page:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| 👤 **Patient (Demo)** | `john.doe@example.com` | `password123` | Bookings, Symptom Triage, Reminders |
| 👩‍⚕️ **Dr. Sarah Patel** | `sarah.patel@healthcare.com` | `password123` | General Medicine, Pre-Visit Summaries, Notes |
| 👨‍⚕️ **Dr. Rajesh Kumar** | `rajesh.kumar@healthcare.com` | `password123` | Cardiology Clinic, Consultation Records |
| 👩‍⚕️ **Dr. Priya Sharma** | `priya.sharma@healthcare.com` | `password123` | Dermatology Clinic |
| 👨‍⚕️ **Dr. Amit Desai** | `amit.desai@healthcare.com` | `password123` | Orthopedics Clinic |
| 👩‍⚕️ **Dr. Meera Nair** | `meera.nair@healthcare.com` | `password123` | Pediatrics Clinic |
| 🛡️ **Hospital Admin** | `admin@healthcare.com` | `password123` | Doctor onboarding, Hospital-wide analytics |

*(Or click **"Continue with Google"** on the patient login to test live two-way synchronization with your personal Google Calendar).*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Patient registration
- `GET/POST /api/auth/[...nextauth]` — NextAuth OAuth & credential session handlers

### Patient Endpoints
- `GET /api/patient/doctors` — Search doctors by specialisation
- `GET /api/patient/slots/[doctorId]?date=YYYY-MM-DD` — Real-time slot availability
- `POST /api/patient/appointments` — Initiate 5-minute atomic slot hold
- `POST /api/patient/appointments/[id]/symptoms` — Submit symptoms & trigger Gemini AI triage
- `GET /api/patient/appointments` — Fetch patient appointment history
- `GET /api/patient/reminders` — Retrieve medication schedules
- `POST /api/patient/reminders` — Create custom multi-time recurring medication reminder
- `DELETE /api/patient/reminders/[id]` — Delete active reminder
- `GET/PUT /api/patient/settings/reminders` — Configure reminder timing preferences

### Doctor Endpoints
- `GET /api/doctor/appointments?date=upcoming` — List doctor's appointments (upcoming/today/all)
- `GET /api/doctor/appointments/[id]` — View appointment details & pre-visit AI triage report
- `POST /api/doctor/appointments/[id]/notes` — Submit clinical notes, Rx, and trigger AI summary

### Admin Endpoints
- `GET /api/admin/doctors` — List all registered doctors
- `POST /api/admin/doctors` — Onboard new physician profile
- `GET/PUT/DELETE /api/admin/doctors/[id]` — Manage physician profile
- `POST/DELETE /api/admin/doctors/[id]/leave` — Manage doctor leave days
- `GET /api/admin/appointments` — Retrieve hospital-wide appointment ledger

### Background Cron Endpoints
- `GET /api/cron/process-jobs` — Email queue processor & expired slot hold cleanup
- `GET /api/cron/appointment-reminders` — 24-hour advance appointment reminder alerts
- `GET /api/cron/medication-reminders` — Scheduled medication reminder dispatcher

---

## 📄 License

This project is licensed under the **MIT License**.
