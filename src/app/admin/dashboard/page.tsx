import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { Users, UserCheck, CalendarDays, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalDoctors, totalPatients, totalAppointments, todayAppointments, recentAppointments] = await Promise.all([
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        date: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { patient: true, doctor: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-50 rounded-full text-cyan-600">
              <Users size={20} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Doctors</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{totalDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-50 rounded-full text-cyan-600">
              <UserCheck size={20} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-50 rounded-full text-cyan-600">
              <Activity size={20} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Appointments</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{totalAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-50 rounded-full text-cyan-600">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{todayAppointments}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Appointments</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Patient</th>
              <th className="px-6 py-3 font-medium">Doctor</th>
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {recentAppointments.map((apt: any) => (
              <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">{apt.patient?.name || 'Unknown'}</td>
                <td className="px-6 py-4">Dr. {apt.doctor?.name || 'Unknown'}</td>
                <td className="px-6 py-4">{format(new Date(apt.date), 'MMMM d, yyyy')} ({apt.startTime} - {apt.endTime})</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                    apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
