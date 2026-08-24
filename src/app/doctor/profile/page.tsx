'use client';

import { useSession } from 'next-auth/react';

export default function DoctorProfile() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Doctor Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-2xl font-bold">
              {session?.user?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              Your profile is managed by the administration. To update your specialty, schedule, or request leave, please contact the admin team.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 uppercase">Role</span>
                <span className="block mt-1 text-gray-800 font-medium">Doctor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
