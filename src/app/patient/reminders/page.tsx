'use client';
import { useEffect, useState } from 'react';
import { Pill, Clock, Calendar } from 'lucide-react';

export default function MedicationRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient/reminders')
      .then(res => res.json())
      .then(data => {
        setReminders(data.reminders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading reminders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Medication Reminders</h1>
      
      {reminders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center flex flex-col items-center">
          <Pill size={48} className="text-cyan-500 mb-3" />
          <p className="text-gray-500">No active medication reminders.</p>
          <p className="text-sm text-gray-400 mt-1">Reminders are automatically created after a doctor completes your visit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((r: any) => (
            <div key={r.id} className="bg-white p-5 rounded-lg shadow border-l-4 border-cyan-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{r.medicationName}</h3>
                  <p className="text-gray-600 mt-1">Dosage: {r.dosage}</p>
                  <p className="text-gray-600">Frequency: {r.frequency}</p>
                  {r.instructions && <p className="text-gray-500 text-sm mt-1">{r.instructions}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {r.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                <span>Start: {new Date(r.startDate).toLocaleDateString()}</span>
                {r.endDate && <span>End: {new Date(r.endDate).toLocaleDateString()}</span>}
                {r.nextReminderAt && <span>Next: {new Date(r.nextReminderAt).toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
