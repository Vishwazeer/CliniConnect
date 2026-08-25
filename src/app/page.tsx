import Link from "next/link";
import { ClipboardList, Brain, Calendar, Pill, Mail, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Clini<span className="text-cyan-600">Connect</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-cyan-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors shadow-sm cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight">
            Your Health,{" "}
            <span className="text-cyan-600">Simplified</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Book appointments, share symptoms in advance, get AI-powered health summaries,
            and stay on top of your medications — all in one place.
          </p>
          <p className="mt-4 text-sm font-semibold text-cyan-700">
            5 Doctors • 24/7 Booking • AI Powered
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-cyan-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Book an Appointment <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-cyan-300 hover:text-cyan-700 transition-colors cursor-pointer"
            >
              Doctor Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ClipboardList className="w-6 h-6 text-cyan-600" />}
            title="Smart Symptom Sharing"
            description="Describe your symptoms before your visit. Our AI generates a summary to help your doctor prepare."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-cyan-600" />}
            title="AI-Powered Summaries"
            description="Get patient-friendly post-visit summaries with medication schedules and follow-up steps."
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6 text-cyan-600" />}
            title="Easy Scheduling"
            description="Appointments automatically sync to your Google Calendar with reminders."
          />
          <FeatureCard
            icon={<Pill className="w-6 h-6 text-cyan-600" />}
            title="Medication Reminders"
            description="Configure reminder times that work for you. Never miss a dose."
          />
          <FeatureCard
            icon={<Mail className="w-6 h-6 text-cyan-600" />}
            title="Email Notifications"
            description="Booking confirmations, reminders, and cancellation notices delivered to your inbox."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-cyan-600" />}
            title="Secure & Private"
            description="Role-based access ensures your health data stays private and secure."
          />
        </div>

        {/* How It Works */}
        <div className="py-16 border-t border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-gray-100 -z-10"></div>
            <StepCard step={1} title="Find a Doctor" description="Search by specialisation and pick a doctor that fits your needs." />
            <StepCard step={2} title="Book a Slot" description="Choose a convenient date and time from available slots." />
            <StepCard step={3} title="Share Symptoms" description="Fill in your symptoms so the doctor gets an AI summary before your visit." />
            <StepCard step={4} title="Get Summary" description="After your visit, receive a patient-friendly summary with medication details." />
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-100 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <Stethoscope className="w-4 h-4" />
          <p>© {new Date().getFullYear()} CliniConnect. Built for better healthcare experiences.</p>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-cyan-200 transition-all cursor-pointer group">
      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center relative">
      <div className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10 shadow-sm border-4 border-white">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
