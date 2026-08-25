"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Registration failed";
        try {
          const data = await res.json();
          errorMessage = data.message || data.error || errorMessage;
        } catch (_) {
          errorMessage = `Server error (${res.status}): Please check database connection.`;
        }
        throw new Error(errorMessage);
      }

      // Auto sign in after successful registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        setError("Account created but failed to sign in automatically.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-cyan-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-800">Create Account</h2>
        <p className="text-slate-500 mt-2">Join our healthcare platform</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {/* Patient Google Sign-Up Notice */}
      <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-center space-y-2">
        <p className="text-xs font-bold text-cyan-900 uppercase tracking-wider">Are you a patient?</p>
        <p className="text-xs text-slate-600">Sign up instantly with Google to enable automatic Google Calendar sync for appointments and medication reminders.</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2 bg-white border border-cyan-200 text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs shadow-xs"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
          Sign Up as Patient with Google
        </button>
      </div>

      <div className="relative flex py-1 items-center mb-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Staff Account Registration
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 mt-4 flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" /> {isLoading ? "Creating Staff Account..." : "Create Staff Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer">
          Sign in
        </Link>
      </p>
    </div>
  );
}
