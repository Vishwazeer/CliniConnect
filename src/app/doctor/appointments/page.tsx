'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Filter, Clock } from 'lucide-react';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dateFilterMode, setDateFilterMode] = useState<'upcoming' | 'today' | 'all' | 'custom'>('upcoming');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const queryDate = dateFilterMode === 'custom' ? customDate : dateFilterMode;
        let url = `/api/doctor/appointments?date=${queryDate}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [dateFilterMode, customDate, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED': return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const u = (urgency || '').toLowerCase();
    if (u.includes('high') || u.includes('urgent')) return 'bg-red-100 text-red-700 border border-red-200';
    if (u.includes('medium') || u.includes('moderate')) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-blue-50 text-blue-700 border border-blue-100';
  };

  const formatAptDate = (dateVal: any) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and review your patient schedule</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Range Filter */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDateFilterMode('upcoming')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'upcoming' ? 'bg-white text-cyan-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('today')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'today' ? 'bg-white text-cyan-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'all' ? 'bg-white text-cyan-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('custom')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'custom' ? 'bg-white text-cyan-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Custom Date
            </button>
          </div>

          {dateFilterMode === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-medium">Loading appointments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-200">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700 text-base">No appointments found</p>
                      <p className="text-xs text-gray-400 mt-1">Try switching to &quot;Upcoming&quot; or &quot;All&quot; to view upcoming consultations.</p>
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {formatAptDate(apt.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        {apt.startTime} - {apt.endTime}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {apt.patient?.name || 'Unknown Patient'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getUrgencyColor(apt.urgency || apt.urgencyLevel)}`}>
                          {apt.urgency || apt.urgencyLevel || 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/doctor/appointments/${apt.id}`}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs inline-block"
                        >
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
