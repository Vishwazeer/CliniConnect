# System Design Write-up

## CliniConnect - Healthcare Appointment & Follow-up Manager

### 1. Double-Booking Prevention

The system employs a multi-layered strategy to prevent double-booking. At the database level, a unique composite index on `(doctorId, date, startTime, status)` ensures that no two appointments can occupy the same slot when their status is either `BOOKED` or `HELD`. This acts as the ultimate safety net — even if application-level checks fail, the database constraint will reject a duplicate insert with a unique violation error.

At the application level, when a patient attempts to book a slot, the system first queries existing appointments for that doctor, date, and time combination. If a match is found (either `BOOKED` or `HELD`), the slot is marked unavailable in the UI. When the patient confirms their selection, the system performs an `INSERT` within a try-catch block. If two patients click the same slot simultaneously, only the first INSERT succeeds; the second triggers a Prisma `P2002` (unique constraint violation) error, which is caught and returns a user-friendly "Slot no longer available" message. This optimistic concurrency control approach avoids database-level locks, keeping the system performant under concurrent load while maintaining correctness.

The slot availability is computed dynamically from the doctor's working hours configuration rather than from pre-created rows, meaning there is no stale data — every availability check reflects the real-time state of bookings.

### 2. Doctor Leave Conflict Handling

When an admin marks a doctor as being on leave for specific dates, the system follows a cascading notification workflow. The leave dates are stored as a JSON array on the `DoctorProfile` model. During the leave update operation, the API handler queries for all existing `BOOKED` appointments on those dates for the affected doctor.

For each conflicting appointment, the system: (a) updates the appointment status to `CANCELLED` with the reason "Doctor on leave", (b) creates an email notification job in the `JobQueue` for the affected patient, and (c) attempts to delete the corresponding Google Calendar event. The admin receives a response indicating how many appointments were affected, providing immediate visibility into the impact.

This entire operation runs within a database transaction to ensure atomicity — either all cancellations succeed or none do, preventing partial state corruption. The email notifications are enqueued rather than sent synchronously, ensuring the admin's request completes quickly while notifications are processed reliably in the background.

### 3. Slot Hold Mechanism

To prevent the scenario where a patient selects a slot but takes time filling the symptom form while another patient tries to book the same slot, the system implements a time-bounded hold mechanism. When a patient selects a slot, an appointment record is created with `status=HELD` and `holdExpiresAt` set to 5 minutes from creation time.

This HELD record participates in the unique constraint, effectively reserving the slot. The patient must complete their symptom form and confirm the booking within this 5-minute window, at which point the status transitions from `HELD` to `BOOKED` and `holdExpiresAt` is cleared. If the patient fails to confirm within the window, a Vercel Cron job running every minute identifies expired holds (where `holdExpiresAt < now`) and deletes them, releasing the slot for other patients.

If a patient attempts to submit symptoms after their hold expires, the API returns a `410 Gone` status, and the UI redirects them to re-select a slot. This mechanism balances user experience (giving patients adequate time to describe symptoms) with fairness (not indefinitely blocking slots for indecisive users).

### 4. Notification Failure Handling

Email notifications are critical but inherently unreliable — SMTP servers may be temporarily unavailable, rate limits may be hit, or network issues may occur. The system addresses this through a job queue pattern with exponential backoff retry.

All email sends are asynchronous. Instead of sending emails inline during API request handling, the system creates a `JobQueue` record with `type=EMAIL`, the email payload, and `status=PENDING`. A Vercel Cron job runs every minute, fetching pending jobs ordered by `scheduledAt` and processing them in batches of 20.

For each job, the processor: (a) marks it as `PROCESSING` and increments the `attempts` counter, (b) attempts to send the email via Nodemailer, (c) on success, marks it `COMPLETED` with a `processedAt` timestamp, (d) on failure, checks if `attempts >= maxAttempts` (default 3). If max attempts reached, the job is marked `FAILED` with the error reason stored for debugging. If retries remain, the job is set back to `PENDING` with `scheduledAt` pushed forward using exponential backoff (`2^attempts` minutes), preventing thundering herd patterns.

This design ensures that transient email failures do not break the user experience — the booking, cancellation, or post-visit flow completes successfully regardless of email delivery status. Failed jobs remain in the database for admin review and manual retry if needed. The same pattern extends to Google Calendar API calls, which are attempted but never block the core workflow on failure.
