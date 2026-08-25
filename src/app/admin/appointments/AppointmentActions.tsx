'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AppointmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === 'COMPLETED' || status === 'CANCELLED') return null;

  async function handleCancel() {
    if (!confirm('Cancel this appointment?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', reason: 'Cancelled by admin' }),
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
    } catch {
      alert('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'BOOKED' }),
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
    } catch {
      alert('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status === 'HELD' && (
        <button
          onClick={handleBook}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Confirm
        </button>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
