"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Stethoscope, ShieldCheck, CalendarCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sarah.patel@healthcare.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error.includes("Patients must sign in") 
        ? "Patients must sign in using the Google button above for Calendar reminders." 
        : "Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-cyan-100 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-cyan-900 tracking-tight">Welcome to CliniConnect</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to manage your health & appointments</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Patient Google Sign-In Section (Primary) */}
      <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50/60 rounded-xl border border-cyan-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-cyan-900">
          <CalendarCheck className="w-5 h-5 text-cyan-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">Patient Portal</h3>
            <p className="text-[11px] text-slate-500 leading-tight">Google sign-in required for automated Calendar reminders</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-cyan-200 text-slate-800 font-semibold py-2.5 px-4 rounded-lg hover:bg-cyan-50/50 hover:border-cyan-300 transition-all shadow-xs cursor-pointer text-sm"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-slate-400 font-medium">
          Doctor & Staff Login
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Staff Quick Fill Dropdown */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Quick Demo Staff Selector:
        </label>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              setEmail(val);
              setPassword("password123");
            }
          }}
          defaultValue="sarah.patel@healthcare.com"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-2xs"
        >
          <option value="sarah.patel@healthcare.com">👩‍⚕️ Dr. Sarah Patel (General Medicine)</option>
          <option value="rajesh.kumar@healthcare.com">👨‍⚕️ Dr. Rajesh Kumar (Cardiology)</option>
          <option value="priya.sharma@healthcare.com">👩‍⚕️ Dr. Priya Sharma (Dermatology)</option>
          <option value="amit.desai@healthcare.com">👨‍⚕️ Dr. Amit Desai (Orthopedics)</option>
          <option value="meera.nair@healthcare.com">👩‍⚕️ Dr. Meera Nair (Pediatrics)</option>
          <option value="admin@healthcare.com">🛡️ Admin User (Hospital Admin)</option>
        </select>
        <p className="text-[10px] text-slate-400">Selecting a doctor automatically fills their credentials below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Doctor / Staff Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            placeholder="doctor@healthcare.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <LogIn className="w-4 h-4" /> {isLoading ? "Signing in..." : "Staff Sign In"}
        </button>
      </form>
    </div>
  );
}

