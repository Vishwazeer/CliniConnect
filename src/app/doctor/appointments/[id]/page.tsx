'use client';

import { useState, useEffect, use } from 'react';

export default function AppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApt = async () => {
      try {
        const res = await fetch(`/api/doctor/appointments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAppointment(data);
        } else {
          setError('Failed to load appointment details');
        }
      } catch (err) {
        setError('Error loading details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApt();
  }, [id]);

  const handleSubmitNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/doctor/appointments/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorNotes: notes, prescription }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointment(updated);
        setShowNotesForm(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit notes');
      }
    } catch (err) {
      setError('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading details...</div>;
  if (!appointment) return <div className="text-red-600">{error || 'Appointment not found'}</div>;

  const pvs = appointment.preVisitSummary;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Detail</h1>
        <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
          {appointment.status}
        </span>
      </div>

      {/* Patient Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{appointment.patient?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{appointment.patient?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Scheduled Time</p>
            <p className="font-medium">{new Date(appointment.startTime).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Pre-Visit Summary */}
      {pvs && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 border-b border-blue-200 pb-2">Pre-Visit Summary</h2>
          <div className="space-y-4 text-blue-900">
            <div>
              <span className="font-medium mr-2">Urgency:</span>
              <span className="px-2 py-0.5 bg-blue-200 rounded text-sm">{pvs.urgency}</span>
            </div>
            <div>
              <span className="font-medium mr-2">Chief Complaint:</span>
              <span>{pvs.chiefComplaint}</span>
            </div>
            {pvs.rawSymptoms && (
              <div>
                <span className="font-medium block mb-1">Reported Symptoms:</span>
                <p className="bg-white p-3 rounded border border-blue-200 text-sm">{pvs.rawSymptoms}</p>
              </div>
            )}
            {pvs.suggestedQuestions && (
              <div>
                <span className="font-medium block mb-1">Suggested Questions:</span>
                <p className="bg-white p-3 rounded border border-blue-200 text-sm whitespace-pre-wrap">{pvs.suggestedQuestions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Area */}
      {appointment.status === 'BOOKED' && !showNotesForm && (
        <button
          onClick={() => setShowNotesForm(true)}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Start Consultation
        </button>
      )}

      {/* Notes Form */}
      {showNotesForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-teal-200">
          <h2 className="text-lg font-semibold text-teal-800 mb-4 border-b border-teal-100 pb-2">Post-Visit Notes</h2>
          <form onSubmit={handleSubmitNotes} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
              <textarea
                required
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter clinical notes, diagnosis, observations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prescription & Plan</label>
              <textarea
                required
                rows={4}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Medications, dosage, follow-up plan..."
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowNotesForm(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving & Generating Summary...' : 'Complete Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Completed Info */}
      {appointment.status === 'COMPLETED' && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Consultation Record</h2>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Clinical Notes</h3>
            <p className="bg-white p-4 border border-gray-200 rounded text-gray-800 whitespace-pre-wrap">{appointment.doctorNotes}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Prescription</h3>
            <p className="bg-white p-4 border border-gray-200 rounded text-gray-800 whitespace-pre-wrap">{appointment.prescription}</p>
          </div>

          {appointment.postVisitSummary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Patient Summary (Generated)</h3>
              <div className="bg-green-50 p-4 border border-green-200 rounded text-green-900 whitespace-pre-wrap">
                {appointment.postVisitSummary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
