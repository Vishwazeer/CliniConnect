import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Clini<span className="text-teal-600">Connect</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
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
            <span className="text-teal-600">Simplified</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Book appointments, share symptoms in advance, get AI-powered health summaries,
            and stay on top of your medications — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
            >
              Book an Appointment
            </Link>
            <Link
              href="/login"
              className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              Doctor Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="📋"
            title="Smart Symptom Sharing"
            description="Describe your symptoms before your visit. Our AI generates a summary to help your doctor prepare."
          />
          <FeatureCard
            icon="🤖"
            title="AI-Powered Summaries"
            description="Get patient-friendly post-visit summaries with medication schedules and follow-up steps."
          />
          <FeatureCard
            icon="📅"
            title="Google Calendar Sync"
            description="Appointments automatically sync to your Google Calendar with reminders."
          />
          <FeatureCard
            icon="💊"
            title="Medication Reminders"
            description="Configure reminder times that work for you. Never miss a dose."
          />
          <FeatureCard
            icon="📧"
            title="Email Notifications"
            description="Booking confirmations, reminders, and cancellation notices delivered to your inbox."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Private"
            description="Role-based access ensures your health data stays private and secure."
          />
        </div>

        {/* How It Works */}
        <div className="py-16 border-t border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard step={1} title="Find a Doctor" description="Search by specialisation and pick a doctor that fits your needs." />
            <StepCard step={2} title="Book a Slot" description="Choose a convenient date and time from available slots." />
            <StepCard step={3} title="Share Symptoms" description="Fill in your symptoms so the doctor gets an AI summary before your visit." />
            <StepCard step={4} title="Get Summary" description="After your visit, receive a patient-friendly summary with medication details." />
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CliniConnect. Built for better healthcare experiences.</p>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-100 transition-all">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
