'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/doctor/appointments?date=today');
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todayPatients = appointments.length;
  const completedToday = appointments.filter(a => a.status === 'COMPLETED').length;
  const pending = appointments.filter(a => a.status === 'BOOKED').length;

  if (loading) return <div className="text-gray-600">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Today&apos;s Overview</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Today&apos;s Patients</div>
          <div className="text-3xl font-bold text-teal-600 mt-2">{todayPatients}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Completed</div>
          <div className="text-3xl font-bold text-teal-600 mt-2">{completedToday}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Pending</div>
          <div className="text-3xl font-bold text-teal-600 mt-2">{pending}</div>
        </div>
      </div>

      {/* Appointments Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Appointments</h2>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Link key={apt.id} href={`/doctor/appointments/${apt.id}`}>
                  <div className="block border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg text-gray-800">
                          {apt.startTime} - {apt.endTime}
                        </div>
                        <div className="text-gray-600">{apt.patient?.name || 'Unknown Patient'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(apt.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(apt.urgencyLevel)}`}>
                        {apt.urgencyLevel || 'Normal'}
                      </div>
                    </div>
                    {apt.preVisitSummary && (
                      <div className="mt-3 text-sm text-gray-600 border-t pt-2">
                        <span className="font-medium text-gray-700">Summary:</span>{' '}
                        {apt.preVisitSummary.length > 100
                          ? apt.preVisitSummary.substring(0, 100) + '...'
                          : apt.preVisitSummary}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
