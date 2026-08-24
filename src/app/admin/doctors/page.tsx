import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDoctors() {
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Doctors</h1>
        <Link href="/admin/doctors/new" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-medium">
          Add New Doctor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Specialisation</th>
              <th className="px-6 py-3 font-medium">Working Hours</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {doctors.map((doctor: any) => (
              <tr key={doctor.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Dr. {doctor.name}</td>
                <td className="px-6 py-4">{doctor.doctorProfile?.specialisation || '-'}</td>
                <td className="px-6 py-4">{doctor.doctorProfile?.workingHoursStart} - {doctor.doctorProfile?.workingHoursEnd}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/doctors/${doctor.id}`} className="text-teal-600 hover:text-teal-800 font-medium mr-4">Edit / Leave</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
