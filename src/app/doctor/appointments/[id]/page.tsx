'use client';

import { useState, useEffect, use } from 'react';
import { Brain, FileText } from 'lucide-react';

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

  if (loading) return <div className="text-gray-600 p-8">Loading details...</div>;
  if (!appointment) return <div className="text-red-600 p-8">{error || 'Appointment not found'}</div>;

  // Format Scheduled Time safely
  let dateFormatted = '';
  if (appointment.date) {
    const d = new Date(appointment.date);
    if (!isNaN(d.getTime())) {
      dateFormatted = d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  const timeFormatted = appointment.startTime
    ? `${appointment.startTime} - ${appointment.endTime || ''}`
    : '';
  const scheduledDisplay = dateFormatted
    ? `${dateFormatted} at ${timeFormatted}`
    : timeFormatted || 'Scheduled';

  // Extract Pre-Visit Summary data safely
  let urgencyText = appointment.urgency || 'Normal';
  let chiefComplaintText = '';
  let summaryNotes = '';
  let questionsList: string[] = [];

  if (appointment.preVisitSummary) {
    if (typeof appointment.preVisitSummary === 'object') {
      urgencyText = appointment.preVisitSummary.urgency || urgencyText;
      chiefComplaintText = appointment.preVisitSummary.chiefComplaint || '';
      summaryNotes = appointment.preVisitSummary.summary || '';
      questionsList = appointment.preVisitSummary.suggestedQuestions || [];
    } else if (typeof appointment.preVisitSummary === 'string') {
      try {
        const parsed = JSON.parse(appointment.preVisitSummary);
        urgencyText = parsed.urgency || urgencyText;
        chiefComplaintText = parsed.chiefComplaint || '';
        summaryNotes = parsed.summary || '';
        questionsList = parsed.suggestedQuestions || [];
      } catch (_) {
        summaryNotes = appointment.preVisitSummary;
      }
    }
  }

  if (!chiefComplaintText) {
    chiefComplaintText = summaryNotes || appointment.symptoms || 'None specified';
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Detail</h1>
        <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold">
          {appointment.status}
        </span>
      </div>

      {/* Patient Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</p>
            <p className="font-semibold text-gray-800 text-base">{appointment.patient?.name || 'Patient'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
            <p className="font-medium text-gray-700 text-sm">{appointment.patient?.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Time</p>
            <p className="font-bold text-cyan-700 text-sm">{scheduledDisplay}</p>
          </div>
        </div>
      </div>

      {/* Pre-Visit Summary */}
      <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/50 p-6 rounded-xl shadow-sm border border-blue-200">
        <h2 className="text-lg font-bold text-blue-950 mb-4 border-b border-blue-200/80 pb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          Pre-Visit Summary & AI Triage
        </h2>
        <div className="space-y-4 text-blue-950">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Urgency Level:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              urgencyText.toLowerCase().includes('high') || urgencyText.toLowerCase().includes('urgent')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : urgencyText.toLowerCase().includes('medium') || urgencyText.toLowerCase().includes('moderate')
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {urgencyText}
            </span>
          </div>

          <div>
            <span className="font-semibold text-sm block mb-1">Chief Complaint & AI Summary:</span>
            <div className="bg-white p-3.5 rounded-lg border border-blue-100 text-sm text-slate-800 leading-relaxed shadow-xs">
              {chiefComplaintText}
            </div>
          </div>

          {(appointment.symptoms || appointment.duration || appointment.medications) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {appointment.symptoms && (
                <div className="bg-white/80 p-3 rounded-lg border border-blue-100 text-xs">
                  <span className="font-bold text-slate-500 block mb-0.5">Reported Symptoms:</span>
                  <span className="text-slate-800 font-medium">{appointment.symptoms}</span>
                </div>
              )}
              {appointment.duration && (
                <div className="bg-white/80 p-3 rounded-lg border border-blue-100 text-xs">
                  <span className="font-bold text-slate-500 block mb-0.5">Duration:</span>
                  <span className="text-slate-800 font-medium">{appointment.duration}</span>
                </div>
              )}
              {appointment.medications && (
                <div className="bg-white/80 p-3 rounded-lg border border-blue-100 text-xs">
                  <span className="font-bold text-slate-500 block mb-0.5">Current Medications:</span>
                  <span className="text-slate-800 font-medium">{appointment.medications}</span>
                </div>
              )}
            </div>
          )}

          {questionsList && questionsList.length > 0 && (
            <div>
              <span className="font-semibold text-sm block mb-1.5">Suggested Clinical Questions:</span>
              <ul className="list-disc pl-5 bg-white p-3.5 rounded-lg border border-blue-100 text-sm text-slate-700 space-y-1">
                {questionsList.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      {appointment.status === 'BOOKED' && !showNotesForm && (
        <button
          onClick={() => setShowNotesForm(true)}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Start Consultation
        </button>
      )}

      {/* Notes Form */}
      {showNotesForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-200">
          <h2 className="text-lg font-semibold text-cyan-800 mb-4 border-b border-cyan-100 pb-2">Post-Visit Notes</h2>
          <form onSubmit={handleSubmitNotes} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
              <textarea
                required
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors disabled:opacity-50"
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
            <div className="bg-green-50 p-6 rounded-lg shadow-sm border-l-4 border-green-500 mt-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 border-b border-green-200 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Post-Visit Summary (Generated)
              </h3>
              <div className="text-green-900 whitespace-pre-wrap">
                {appointment.postVisitSummary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
