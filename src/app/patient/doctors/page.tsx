'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, Clock, CalendarPlus } from 'lucide-react';

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
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search doctors..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border rounded-md focus:ring-cyan-500 focus:border-cyan-500"
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
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-800 font-bold text-xl">
                {doctor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.name}</h3>
                <div className="flex items-center gap-1 text-cyan-600 font-medium mt-1">
                  <Star size={14} className="fill-current" />
                  <p>{doctor.doctorProfile?.specialisation}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">{doctor.doctorProfile?.qualifications}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Available
              </span>
              <Link 
                href={`/patient/book/${doctor.id}`}
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <CalendarPlus size={16} />
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
