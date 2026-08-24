'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [leaveDates, setLeaveDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/admin/doctors/${id}`);
        if (!res.ok) throw new Error('Failed to fetch doctor');
        const data = await res.json();
        setDoctor(data);
        setLeaveDates(data.doctorProfile?.leaveDays || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    data.slotDurationMinutes = parseInt(data.slotDurationMinutes as string) as any;

    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update doctor');
      router.push('/admin/doctors');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLeave = async () => {
    if (!newLeaveDate) return;
    try {
      const res = await fetch(`/api/admin/doctors/${id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: [newLeaveDate] }),
      });
      if (!res.ok) throw new Error('Failed to add leave');
      const result = await res.json();
      setLeaveDates((prev) => [...new Set([...prev, ...result.addedDates])]);
      setNewLeaveDate('');
      if (result.affectedAppointments > 0) {
        alert(`Warning: ${result.affectedAppointments} appointments were cancelled due to this leave.`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveLeave = async (date: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error('Failed to remove leave');
      setLeaveDates((prev) => prev.filter((d) => d !== date));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!doctor) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Doctor Profile</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required name="name" type="text" defaultValue={doctor.name} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" type="text" defaultValue={doctor.phone} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
              <input required name="specialisation" type="text" defaultValue={doctor.doctorProfile?.specialisation} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
              <input required name="qualifications" type="text" defaultValue={doctor.doctorProfile?.qualifications} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="bio" rows={3} defaultValue={doctor.doctorProfile?.bio} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"></textarea>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input required name="workingHoursStart" type="text" defaultValue={doctor.doctorProfile?.workingHoursStart} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input required name="workingHoursEnd" type="text" defaultValue={doctor.doctorProfile?.workingHoursEnd} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
              <input required name="slotDurationMinutes" type="number" defaultValue={doctor.doctorProfile?.slotDurationMinutes} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Doctor'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Leave Management</h2>
        <div className="flex space-x-2 mb-4">
          <input 
            type="date" 
            value={newLeaveDate} 
            onChange={(e) => setNewLeaveDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button 
            type="button"
            onClick={handleAddLeave}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Add Leave Date
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {leaveDates.map((date) => (
            <div key={date} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              <span>{date}</span>
              <button onClick={() => handleRemoveLeave(date)} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
          ))}
          {leaveDates.length === 0 && <span className="text-gray-500 text-sm">No leave dates scheduled.</span>}
        </div>
      </div>
    </div>
  );
}
