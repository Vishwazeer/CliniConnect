import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Clean up expired holds
    const expiredHolds = await prisma.appointment.deleteMany({
      where: {
        status: "HELD",
        holdExpiresAt: { lt: new Date() },
      },
    });

    // 2. Process pending email jobs
    const pendingJobs = await prisma.jobQueue.findMany({
      where: {
        status: "PENDING",
        type: "EMAIL",
        scheduledAt: { lte: new Date() },
      },
      take: 20,
      orderBy: { scheduledAt: "asc" },
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const job of pendingJobs) {
      // Mark as processing
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: "PROCESSING", attempts: { increment: 1 } },
      });

      const payload = job.payload as any as { to: string; subject: string; html: string };
      const success = await sendEmail(payload);

      if (success) {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: { status: "COMPLETED", processedAt: new Date() },
        });
        emailsSent++;
      } else {
        const newAttempts = job.attempts + 1;
        if (newAttempts >= job.maxAttempts) {
          await prisma.jobQueue.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              failedReason: "Max attempts reached",
            },
          });
        } else {
          // Retry with exponential backoff
          const retryAt = new Date(
            Date.now() + 1000 * Math.pow(2, newAttempts) * 60
          );
          await prisma.jobQueue.update({
            where: { id: job.id },
            data: {
              status: "PENDING",
              scheduledAt: retryAt,
            },
          });
        }
        emailsFailed++;
      }
    }

    return NextResponse.json({
      expiredHoldsCleared: expiredHolds.count,
      emailsSent,
      emailsFailed,
      jobsProcessed: pendingJobs.length,
    });
  } catch (error) {
    console.error("Cron process-jobs error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
