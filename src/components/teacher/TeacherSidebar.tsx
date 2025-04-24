'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    // Get teacher ID and classId from localStorage if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setTeacherId(parsedUserData.teacherId || null);
          setClassId(parsedUserData.classSectionId || null);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, []);

  const handleAssignmentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (classId) {
      router.push(`/t/classes/${classId}/assignments`);
    } else {
      // If no class ID, go to dashboard
      router.push('/t/dashboard');
    }
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (classId) {
      router.push(`/t/classes/${classId}/notes`);
    } else {
      // If no class ID, go to classes page
      router.push('/t/classes' as any);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/t/dashboard', icon: '📊' },
    { name: 'Exams', href: `/t/classes/${classId}/exams`, icon: '📝' },
    { name: 'Assignments', href: '#', icon: '📚', onClick: handleAssignmentsClick },
    { name: 'Notes', href: '#', icon: '📔', onClick: handleNotesClick },
    { name: 'Attendance', href: '/t/attendance', icon: '📋' },
    { name: 'Classes', href: '/t/classes', icon: '👨‍🏫' },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <div className="mb-8">
          <Link href="/t/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">ABIV</span>
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            // Check if this is the assignments or notes link
            const isAssignments = item.name === 'Assignments';
            const isNotes = item.name === 'Notes';

            // For assignments, check if pathname includes '/assignments'
            // For notes, check if pathname includes '/notes'
            // For classes, ensure pathname is exactly '/t/classes' or starts with it but doesn't contain '/assignments' or '/notes'
            // For other links, use regular startsWith check
            let isActive = false;

            if (isAssignments) {
              isActive = pathname.includes('/assignments');
            } else if (isNotes) {
              isActive = pathname.includes('/notes');
            } else if (item.name === 'Classes') {
              isActive = pathname === '/t/classes' ||
                (pathname.startsWith('/t/classes/') && !pathname.includes('/assignments') && !pathname.includes('/notes'));
            } else {
              isActive = pathname.startsWith(item.href);
            }

            return (
              <Link
                key={item.name}
                href={item.href as any}
                onClick={item.onClick}
                className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center">
          <span className="mr-3">🚪</span>
          <LogoutButton className="text-gray-700 w-fit text-left" />
        </div>
      </div>
    </aside>
  );
} 