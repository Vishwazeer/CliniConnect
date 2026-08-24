'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Doctors', href: '/admin/doctors' },
    { name: 'Appointments', href: '/admin/appointments' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-700 text-teal-400">
          Admin Portal
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded transition-colors ${
                pathname.startsWith(item.href) ? 'bg-slate-600' : 'hover:bg-slate-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">CliniConnect Admin</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
