'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import {
  LayoutDashboard,
  FileText,
  BookOpenCheck,
  NotebookText,
  CalendarCheck2,
  Users2,
  PenLine,
  LogOut
} from 'lucide-react';
import Image from 'next/image';

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
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
    router.push(`/t/assignments`);
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/t/notes`);
  };

  const navItems = [
    { name: 'Dashboard', href: '/t/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Exams', href: `/t/classes/${classId}/exams`, icon: <PenLine size={18} /> },
    { name: 'Assignments', href: '#', icon: <BookOpenCheck size={18} />, onClick: handleAssignmentsClick },
    { name: 'Notes', href: '#', icon: <NotebookText size={18} />, onClick: handleNotesClick },
    { name: 'Attendance', href: '/t/attendance', icon: <CalendarCheck2 size={18} /> },
    { name: 'Classes', href: '/t/classes', icon: <Users2 size={18} /> },
    { name: 'Copy checking', href: '/t/pythonCopyChecking', icon: <FileText size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        {/* Logo */}
        <div className="mb-8 flex items-center">
          <Image
                      src="https://media-hosting.imagekit.io/ec92e4e35be64d63/navlogo.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=l6NqfsMDqkEtJKGne9jQGByswyVWZVOrHU2GGaayrbu4NTBQuKV5FZ4c-II7yle67m~uWVboQmHUb3kogbqNjNUkwJpSK5md7ufqh-ru1VYWk88f8SjXjRfRFxxxMayQzi3Bnoc4iLtuaL25zHXMpKaZSnTPwgbykC9UK2ZVRvwMz6aUFc7eTfDXJoz1tITJ1C2SCfffvvc9Z~1g45cQd0Gl447yTrqqw~XEAl1ekj4Wrnf5sqq6dvFgYpdciK~QUYl8olW9UAea6ZKHRAw2W6sqM0cAjyzxDbHS4GrN7muT9zd5pvkPwbt~A50mkyWKN68FDikIyfwnrqp989YQyw__"
                      alt="Logo"
                      width={160}
                      height={40}
                      className="object-contain"
                    />      
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isAssignments = item.name === 'Assignments';
            const isNotes = item.name === 'Notes';

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
                className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${
                  isActive
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

      {/* Logout */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center">
          <LogOut size={18} className="mr-3 text-gray-700" />
          <LogoutButton className="text-gray-700 w-fit text-left" />
        </div>
      </div>
    </aside>
  );
}
