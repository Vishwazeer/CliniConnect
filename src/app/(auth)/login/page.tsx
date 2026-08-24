"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("john.doe@example.com");
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
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-teal-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-teal-800">Welcome Back</h2>
        <p className="text-slate-500 mt-2">Sign in to your account</p>
      </div>

      {/* Demo Credentials Quick Fill */}
      <div className="mb-6 p-3 bg-teal-50 rounded-lg border border-teal-100">
        <p className="text-xs font-semibold text-teal-800 mb-2">Demo Quick Login:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@healthcare.com");
              setPassword("password123");
            }}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 py-1 px-2.5 rounded border border-slate-200 transition-colors font-medium"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("sarah.patel@healthcare.com");
              setPassword("password123");
            }}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 py-1 px-2.5 rounded border border-slate-200 transition-colors font-medium"
          >
            Doctor (Sarah)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("john.doe@example.com");
              setPassword("password123");
            }}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 py-1 px-2.5 rounded border border-slate-200 transition-colors font-medium"
          >
            Patient (John)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
        <span className="text-xs text-center text-slate-500 uppercase">Or continue with</span>
        <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
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
        Sign in with Google
      </button>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
