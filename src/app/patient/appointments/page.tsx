'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');

  useEffect(() => {
    fetch('/api/patient/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data.appointments || []));
  }, []);

  const getFilteredAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      if (tab === 'Cancelled') return apt.status === 'CANCELLED';
      if (tab === 'Upcoming') return apt.status === 'BOOKED' && new Date(apt.date) >= now;
      if (tab === 'Past') return apt.status === 'COMPLETED' || (apt.status === 'BOOKED' && new Date(apt.date) < now);
      return false;
    });
  };

  const filtered = getFilteredAppointments();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>

      <div className="flex border-b border-gray-200">
        {['Upcoming', 'Past', 'Cancelled'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              tab === t ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No {tab.toLowerCase()} appointments found.
          </div>
        ) : (
          filtered.map(apt => (
            <Link key={apt.id} href={`/patient/appointments/${apt.id}`}>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg text-gray-900">Dr. {apt.doctor?.name || 'Unknown'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      apt.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {apt.startTime}
                  </div>
                </div>
                <div className="text-cyan-600 font-medium whitespace-nowrap flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details &rarr;
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
