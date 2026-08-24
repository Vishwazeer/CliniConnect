'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/patient/dashboard' },
    { name: 'Find Doctors', href: '/patient/doctors' },
    { name: 'My Appointments', href: '/patient/appointments' },
    { name: 'Medication Reminders', href: '/patient/reminders' },
    { name: 'Settings', href: '/patient/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-teal-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-teal-700">HealthPortal</div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded ${pathname.startsWith(item.href) ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="font-medium text-gray-700">
            Welcome, {session?.user?.name || 'Patient'}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-teal-600 hover:text-teal-800 font-medium"
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
