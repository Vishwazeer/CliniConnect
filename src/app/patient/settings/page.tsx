'use client';
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [times, setTimes] = useState<{ time: string, label: string }[]>([]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/patient/settings/reminders')
      .then(res => res.json())
      .then(data => setTimes(data.times || []))
      .catch(() => {});
  }, []);

  const handleSave = async (updatedTimes: any[]) => {
    setSaving(true);
    await fetch('/api/patient/settings/reminders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ times: updatedTimes })
    });
    setSaving(false);
  };

  const addTime = () => {
    if (!newTime) return;
    const updated = [...times, { time: newTime, label: newLabel || 'Reminder' }];
    setTimes(updated);
    handleSave(updated);
    setNewTime('');
    setNewLabel('');
  };

  const removeTime = (index: number) => {
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
    handleSave(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-600" />
          Medication Reminder Preferences
        </h2>
        <p className="text-gray-500 mb-6">Configure the default times you prefer to receive medication reminders.</p>

        <div className="space-y-4 mb-8">
          {times.length === 0 ? (
            <div className="text-gray-500 text-sm">No reminder times configured.</div>
          ) : (
            times.map((t, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                <div>
                  <span className="font-bold text-gray-900">{t.time}</span>
                  <span className="ml-2 text-gray-500 text-sm">- {t.label}</span>
                </div>
                <button 
                  onClick={() => removeTime(i)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Add New Reminder Time</h3>
          <div className="flex gap-4">
            <input 
              type="time" 
              className="px-3 py-2 border rounded focus:ring-cyan-500 focus:border-cyan-500"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Label (e.g. Morning)" 
              className="flex-1 px-3 py-2 border rounded focus:ring-cyan-500 focus:border-cyan-500"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
            />
            <button 
              onClick={addTime}
              disabled={!newTime || saving}
              className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
