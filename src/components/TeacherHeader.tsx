'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

interface TeacherHeaderProps {
  className?: string;
  classId: string;
}

const TeacherHeader: FC<TeacherHeaderProps> = ({ className, classId }) => {
  const pathname = usePathname();

  const tabs = [
    { name: 'Class Details', href: `/t/classes/${classId}` },
    { name: 'Attendance', href: `/t/classes/${classId}/attendance` },
    { name: 'Exams', href: `/t/classes/${classId}/exams` },
    { name: 'Assignments', href: `/t/classes/${classId}/assignments` },
    { name: 'Copy Checking', href: `/t/classes/${classId}/copy-checking` },
    { name: 'Notes & Materials', href: `/t/classes/${classId}/notes` },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.includes(href);
  };

  return (
    <div className={`${className || ''} w-full`}>
      <div className="flex items-center mb-4">
        <Link href="/t/dashboard" className="flex items-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="ml-2">Class 10th - C</span>
        </Link>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${isActive(tab.href)
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TeacherHeader; 