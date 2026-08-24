'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/patient/appointments?status=BOOKED').then(res => res.json()),
      fetch('/api/patient/reminders').then(res => res.json())
    ]).then(([apptData, remData]) => {
      setAppointments(apptData.appointments || []);
      setReminders(remData.reminders || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-teal-600">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Next Appointment</h2>
          <div className="text-2xl font-bold text-gray-900">{appointments[0] ? new Date(appointments[0].date).toLocaleDateString() : 'None'}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-teal-600">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Active Medications</h2>
          <div className="text-2xl font-bold text-gray-900">{reminders.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-teal-600">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Upcoming Visits</h2>
          <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">No upcoming appointments.</div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Dr. {apt.doctor?.user?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()} at {apt.startTime}</div>
                </div>
                <div className="flex items-center space-x-4">
                  {apt.urgencyLevel && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(apt.urgencyLevel)}`}>
                      {apt.urgencyLevel}
                    </span>
                  )}
                  <Link href={`/patient/appointments/${apt.id}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
