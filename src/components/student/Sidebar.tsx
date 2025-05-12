'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LogoutButton } from '@/components/auth/logout-button';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { title: 'My Classes', href: '/s/dashboard', icon: '📊' },
    { title: 'Notes Library', href: '/s/notes', icon: '📔' },
    { title: 'Assignments', href: '/s/assignments', icon: '📚' },
    { title: 'Exams and Reports', href: '/s/exams', icon: '📝' },
    { title: 'Mentorship', href: '/s/mentorship', icon: '🌟' },
    {title:'Report Card', href:'/s/report', icon:'📈'},
    { title: 'Ask Teacher', href: '/s/ask-teacher', icon: '❓' },
    
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <div className="mb-8">
          <Link href="/s/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">AI Classroom</span>
          </Link>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.title}
                href={item.href as any}
              >
                <div
                  className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
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