'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { title: 'My Classes', href: '/s/dashboard', icon: '⬚' },
    { title: 'Notes Library', href: '/s/notes', icon: '📄' },
    { title: 'Assignments', href: '/s/assignments', icon: '📝' },
    { title: 'Exams and Reports', href: '/s/exams', icon: '📊' },
    { title: 'Ask Teacher', href: '/s/ask-teacher', icon: '❓' },
  ];

  return (
    <div className="bg-white w-64 h-full shadow-md py-4 flex flex-col">
      <div className="px-6 mb-8">
        <div className="flex items-center">
          <Image 
            src="/vercel.svg" 
            alt="ABIV Logo" 
            width={40} 
            height={40}
            className="mr-2"
            onError={(e) => {
              // Fallback if image is not found
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='20'%3EA%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="text-xl font-bold">ABIV</span>
        </div>
      </div>
      
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link href={item.href}>
                <div 
                  className={`flex items-center px-6 py-3 ${
                    pathname === item.href 
                      ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 