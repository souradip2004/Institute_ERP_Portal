'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import {
  LayoutDashboard,
  NotebookText,
  BookOpenCheck,
  FileText,
  Sparkles,
  BarChart3,
  MessageSquareQuoteIcon,
  LogOut
} from 'lucide-react';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { title: 'My Classes', href: '/s/dashboard', icon: <LayoutDashboard size={18} /> },
    { title: 'Notes Library', href: '/s/notes', icon: <NotebookText size={18} /> },
    { title: 'Assignments', href: '/s/assignments', icon: <BookOpenCheck size={18} /> },
    { title: 'Exams and Reports', href: '/s/exams', icon: <FileText size={18} /> },
    { title: 'Mentorship', href: '/s/mentorship', icon: <Sparkles size={18} /> },
    { title: 'Report Card', href: '/s/report', icon: <BarChart3 size={18} /> },
    { title: 'Ask Teacher', href: '/s/ask-teacher', icon: <MessageSquareQuoteIcon size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        {/* Logo Section */}
        <div className="mb-8 flex items-center">
 <Image
                      src="https://media-hosting.imagekit.io/ec92e4e35be64d63/navlogo.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=l6NqfsMDqkEtJKGne9jQGByswyVWZVOrHU2GGaayrbu4NTBQuKV5FZ4c-II7yle67m~uWVboQmHUb3kogbqNjNUkwJpSK5md7ufqh-ru1VYWk88f8SjXjRfRFxxxMayQzi3Bnoc4iLtuaL25zHXMpKaZSnTPwgbykC9UK2ZVRvwMz6aUFc7eTfDXJoz1tITJ1C2SCfffvvc9Z~1g45cQd0Gl447yTrqqw~XEAl1ekj4Wrnf5sqq6dvFgYpdciK~QUYl8olW9UAea6ZKHRAw2W6sqM0cAjyzxDbHS4GrN7muT9zd5pvkPwbt~A50mkyWKN68FDikIyfwnrqp989YQyw__"
                      alt="Logo"
                      width={160}
                      height={40}
                      className="object-contain"
                    />   
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.title} href={item.href as any}>
                <div
                  className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${
                    isActive
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

      {/* Logout Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center">
          <LogOut size={18} className="mr-3 text-gray-700" />
          <LogoutButton className="text-gray-700 w-fit text-left" />
        </div>
      </div>
    </aside>
  );
}
