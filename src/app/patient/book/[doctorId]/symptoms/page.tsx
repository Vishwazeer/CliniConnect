'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

export default function SymptomsPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes hold
  
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [currentMeds, setCurrentMeds] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Hold expired. Please try booking again.');
          router.push(`/patient/book/${use(params).doctorId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [appointmentId, router, params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;
    setSubmitting(true);

    const res = await fetch(`/api/patient/appointments/${appointmentId}/symptoms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, duration, severity, currentMeds })
    });

    if (res.ok) {
      router.push('/patient/dashboard');
    } else {
      if (res.status === 410) {
        alert('Hold expired.');
        router.push(`/patient/book/${use(params).doctorId}`);
      } else {
        alert('Failed to save symptoms.');
        setSubmitting(false);
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex justify-between items-center shadow-sm">
        <div className="text-yellow-800 font-medium">Slot held temporarily. Please complete details to confirm.</div>
        <div className="text-xl font-mono font-bold text-yellow-800">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Patient Symptoms & Details</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint / Symptoms *</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Describe your symptoms in detail..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g. 3 days"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={severity}
                onChange={e => setSeverity(e.target.value)}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications (optional)</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="List any medications you are currently taking"
              value={currentMeds}
              onChange={e => setCurrentMeds(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting || timeLeft === 0}
              className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
