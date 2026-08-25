'use client';
import { useEffect, useState } from 'react';
import { Pill, Clock, Calendar, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function MedicationRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = () => {
    fetch('/api/patient/reminders')
      .then(res => res.json())
      .then(data => {
        setReminders(data.reminders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load reminders:", err);
        setError("Could not load medication reminders.");
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName || !dosage || !frequency) {
      setError('Medication Name, Dosage, and Frequency are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/patient/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationName,
          dosage,
          frequency,
          instructions: instructions || null,
          startDate,
          endDate: endDate || null,
          nextReminderAt: startDate ? new Date(startDate).toISOString() : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReminders(prev => [data.reminder, ...prev]);
        
        // Reset form fields
        setMedicationName('');
        setDosage('');
        setFrequency('Daily');
        setInstructions('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create reminder');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    setError('');
    try {
      const res = await fetch(`/api/patient/reminders/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setReminders(prev => prev.filter(r => r.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete reminder');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the reminder');
    }
  };

  if (loading) return <div className="text-cyan-600 font-medium p-4">Loading reminders...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Medication Reminders</h1>
        <p className="text-gray-500 mt-1">Add and manage your medications and scheduling notifications.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Add Reminder Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-cyan-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
            <Plus size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Add New Medication Reminder</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Paracetamol"
              value={medicationName}
              onChange={e => setMedicationName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Dosage *
            </label>
            <input
              type="text"
              placeholder="e.g. 500mg, 1 tablet"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Frequency *
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            >
              <option value="Daily">Daily</option>
              <option value="Twice a day">Twice a day</option>
              <option value="Three times a day">Three times a day</option>
              <option value="Four times a day">Four times a day</option>
              <option value="Weekly">Weekly</option>
              <option value="As needed">As needed (PRN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Take after breakfast"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Adding...' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Pill size={22} className="text-cyan-600" />
          Active Medications
        </h2>

        {reminders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <Pill size={48} className="text-cyan-500/40 mb-3 animate-pulse" />
            <p className="text-gray-500 font-medium">No medication reminders found.</p>
            <p className="text-sm text-gray-400 mt-1">You can add your own custom reminders above, or they will be created automatically after a doctor consultation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reminders.map((r: any) => (
              <div key={r.id} className="bg-white p-5 rounded-xl shadow-sm border border-cyan-50/70 hover:border-cyan-100 transition-all duration-200 flex flex-col justify-between md:flex-row md:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{r.medicationName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${r.isActive ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-6 text-sm text-gray-600">
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-400">Dosage:</span> {r.dosage}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-400">Frequency:</span> {r.frequency}
                    </p>
                    {r.instructions && (
                      <p className="sm:col-span-2 md:col-span-1 flex items-center gap-1.5">
                        <span className="font-medium text-gray-400 font-semibold">Notes:</span> {r.instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Start: {new Date(r.startDate).toLocaleDateString()}</span>
                    {r.endDate && <span className="flex items-center gap-1"><Calendar size={12} /> End: {new Date(r.endDate).toLocaleDateString()}</span>}
                    {r.nextReminderAt && <span className="flex items-center gap-1 text-cyan-600"><Clock size={12} /> Next: {new Date(r.nextReminderAt).toLocaleString()}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Reminder"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
