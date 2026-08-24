'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      const url = new URL('/api/patient/doctors', window.location.origin);
      if (specialisation) url.searchParams.set('specialisation', specialisation);
      const res = await fetch(url.toString());
      const data = await res.json();
      setDoctors(data.doctors || []);
    };
    fetchDoctors();
  }, [specialisation]);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Find Doctors</h1>
      
      <div className="flex space-x-4">
        <input 
          type="text" 
          placeholder="Search doctors..." 
          className="flex-1 px-4 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="px-4 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
          value={specialisation}
          onChange={e => setSpecialisation(e.target.value)}
        >
          <option value="">All Specialisations</option>
          <option value="CARDIOLOGY">Cardiology</option>
          <option value="DERMATOLOGY">Dermatology</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold text-xl">
                {doctor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.name}</h3>
                <p className="text-teal-600 font-medium">{doctor.doctorProfile?.specialisation}</p>
                <p className="text-sm text-gray-500">{doctor.doctorProfile?.qualifications}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Available
              </span>
              <Link 
                href={`/patient/book/${doctor.id}`}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
