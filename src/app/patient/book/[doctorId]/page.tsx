'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function BookAppointmentPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const router = useRouter();
  const { doctorId } = use(params);
  const [doctor, setDoctor] = useState<any>(null);
  const [date, setDate] = useState<string>('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple date generator for next 14 days
  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetch('/api/patient/doctors')
      .then(res => res.json())
      .then(data => {
        const found = (data.doctors || []).find((d: any) => d.id === doctorId);
        if (found) setDoctor(found);
      })
      .catch(() => {});
  }, [doctorId]);

  useEffect(() => {
    if (date) {
      setLoading(true);
      fetch(`/api/patient/slots/${doctorId}?date=${date}`)
        .then(res => res.json())
        .then(data => setSlots(data.slots || []))
        .finally(() => setLoading(false));
    }
  }, [date, doctorId]);

  const handleSlotClick = async (startTime: string) => {
    const res = await fetch('/api/patient/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, date, startTime })
    });
    
    if (res.ok) {
      const data = await res.json();
      router.push(`/patient/book/${doctorId}/symptoms?appointmentId=${data.appointmentId}`);
    } else {
      alert('Slot already taken or error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        {doctor && (
          <div className="text-gray-600">
            Booking with <span className="font-semibold">Dr. {doctor.name}</span>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Select Date</h2>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {next14Days.map(d => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border ${
                date === d ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm">{new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="font-bold">{new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
            </button>
          ))}
        </div>
      </div>

      {date && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Available Slots</h2>
          {loading ? (
            <div className="text-gray-500">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="text-gray-500">No slots available for this date.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  disabled={!slot.available}
                  onClick={() => handleSlotClick(slot.startTime)}
                  className={`py-2 px-3 rounded text-sm font-medium ${
                    slot.available 
                      ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white border border-cyan-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
