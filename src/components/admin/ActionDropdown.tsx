'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react'; // or any other icon lib you use
import { LogoutButton } from '@/components/auth/logout-button';
import DeleteInstitutionButton from '@/components/ui/deleteInstitutions';

export default function ActionDropdown({ institutionId, userId }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 shadow-sm transition"
      >
        Actions
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
            <LogoutButton />
          </div>
          <div className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
            <DeleteInstitutionButton institutionId={institutionId} userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
}
