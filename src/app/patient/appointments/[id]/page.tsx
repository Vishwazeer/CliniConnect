'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Brain, AlertTriangle, FileText } from 'lucide-react';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [apt, setApt] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/patient/appointments/${id}`)
      .then(res => res.json())
      .then(data => setApt(data.appointment));
  }, [id]);

  if (!apt) return <div>Loading...</div>;

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const res = await fetch(`/api/patient/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (res.ok) {
        setApt({ ...apt, status: 'CANCELLED' });
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment with Dr. {apt.doctor?.user?.name}</h1>
            <p className="text-gray-500 mt-1">
              {new Date(apt.date).toLocaleDateString()} • {apt.startTime} - {apt.endTime}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            apt.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
            apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {apt.status}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">Symptoms Reported</h3>
            <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{apt.symptoms}</p>
          </div>
        </div>

        {apt.status === 'BOOKED' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-600" />
              Pre-visit Summary (AI Generated)
            </h2>
            {apt.urgencyLevel && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Assessed Urgency: {apt.urgencyLevel}
                </span>
              </div>
            )}
            <div className="bg-blue-50 p-4 rounded-lg text-blue-900 whitespace-pre-wrap">
              {apt.preVisitSummary || 'Preparing summary...'}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        )}

        {apt.status === 'COMPLETED' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Post-visit Summary
            </h2>
            <div className="bg-green-50 p-4 rounded-lg text-green-900 whitespace-pre-wrap">
              {apt.postVisitSummary || 'No summary available.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
