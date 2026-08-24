import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (role === "DOCTOR") {
    redirect("/doctor/dashboard");
  } else {
    redirect("/patient/dashboard");
  }
}
