'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, UserCircle, LogOut, Stethoscope } from 'lucide-react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: CalendarDays },
    { name: 'Profile', href: '/doctor/profile', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">CliniConnect</span>
            <span className="block text-xs text-slate-400">Doctor Portal</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 py-2 text-sm text-slate-400 mb-2">
            Dr. {session?.user?.name || 'Doctor'}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome, Dr. {session?.user?.name || 'Doctor'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
