import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const pathname = nextUrl.pathname;

      // Public routes
      const publicPaths = ["/", "/login", "/register", "/api/auth"];
      if (publicPaths.some((p) => pathname.startsWith(p))) {
        return true;
      }

      // Cron routes (skip auth check in middleware, route handlers handle CRON_SECRET)
      if (pathname.startsWith("/api/cron")) {
        return true;
      }

      if (!isLoggedIn) return false;

      // Role protections
      if (pathname.startsWith("/admin") && role !== "ADMIN") return false;
      if (pathname.startsWith("/doctor") && role !== "DOCTOR") return false;
      if (pathname.startsWith("/patient") && role !== "PATIENT") return false;

      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        (token as any).role = (user as { role: string }).role;
        (token as any).id = user.id;
      }
      if (account?.provider === "google") {
        (token as any).accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token as any).id as string;
        session.user.role = (token as any).role as string;
        (session as any).accessToken = (token as any).accessToken as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

