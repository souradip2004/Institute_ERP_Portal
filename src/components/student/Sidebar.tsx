'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LogoutButton} from '@/components/auth/logout-button';
import {
  LayoutDashboard,
  NotebookText,
  BookOpenCheck,
  FileText,
  MessageSquareQuoteIcon,
  IndianRupeeIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  onSidebarToggle: (isOpen: boolean) => void;
}

const isLightColor = (hex: string) => {
  if (!hex || hex.length < 7) return false; // Guard against invalid color strings
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  // Using the WCAG formula for relative luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6; // Threshold for what's considered a "light" color
};

export default function Sidebar({onSidebarToggle}: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [institution, setInstitution] = useState<any>(null);
  const [color, setColor] = useState<string>("#FFFFFF"); // Default to white
  const [institutionType, setInstitutionType] = useState<string | null>(null);

  // Effect to fetch institution data on mount
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const userData = JSON.parse(localStorage.getItem("user")!);
      const institutionId = userData?.institutionId;
      setInstitutionType(userData?.institutionType || null);

      if (institutionId) {
        const fetchInstitute = async () => {
          try {
            const res = await fetch(`/api/institutions/${institutionId}`);
            if (!res.ok) throw new Error('Failed to fetch institution data');
            const data = await res.json();
            setInstitution(data);
            setColor(data.primaryColor || "#FFFFFF");
            // Set color in localStorage for other parts of the app to use
            if (data.primaryColor) {
              localStorage.setItem('primaryColor', data.primaryColor);
            }
          } catch (error) {
            console.error("Error fetching institution:", error);
          }
        };
        fetchInstitute();
      }
    }
  }, []);

  // Effect to handle responsive behavior and screen resizing
  useEffect(() => {
    const checkScreenSize = () => {
      const currentIsMobile = window.innerWidth < 768;
      setIsMobile(currentIsMobile);
      setIsOpen(!currentIsMobile);
      onSidebarToggle(!currentIsMobile);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onSidebarToggle]); // Prop is a dependency

  useEffect(() => {
    onSidebarToggle(isOpen);
  }, [isOpen, onSidebarToggle]);

  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsOpen(false); // Close sidebar after navigation on mobile
    }
  };

  const menuItems = [
    {title: 'My Classes', href: '/s/dashboard', icon: <LayoutDashboard size={18}/>},
    {title: 'Notes Library', href: '/s/notes', icon: <NotebookText size={18}/>},
    {
      title: institutionType?.includes("College") ? 'Assignments' : "Homeworks",
      href: '/s/assignments',
      icon: <BookOpenCheck size={18}/>
    },
    {title: 'Exams and Reports', href: '/s/exams', icon: <FileText size={18}/>},
// {title: 'Mentorship', href: '/s/mentorship', icon: <Sparkles size={18}/>},
// {title: 'Report Card', href: '/s/report', icon: <BarChart3 size={18}/>},
    {title: 'Ask Teacher', href: '/s/ask-teacher', icon: <MessageSquareQuoteIcon size={18}/>},
    {title: 'Fees', href: '/s/fees', icon: <IndianRupeeIcon size={18}/>},
    {title: "Notices", href: '/s/notice', icon: <FileText size={18}/>},
  ];

  const textColorIsBlack = isLightColor(color);

  return (
    <>
      {/* A single button to OPEN the sidebar (visible on mobile and collapsed desktop) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
          aria-label="Open sidebar"
        >
          <Menu size={24}/>
        </button>
      )}

      {/* Overlay for mobile view when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200  transition-transform duration-300 ease-in-out w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center min-w-0"> {/* Wrapper to prevent text overflow issues */}
              {institution?.logoUrl && (
                <Image
                  src={institution.logoUrl}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain flex-shrink-0"
                />
              )}
              {institution?.name && (
                <span className="text-sm font-semibold text-gray-800 ml-2 whitespace-normal break-words">
                  {institution.name}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X size={24}/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={handleNavLinkClick}
                  className={`flex items-center px-4 py-3 text-base rounded-md transition-colors group ${isActive ? 'font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  style={isActive ? {
                    backgroundColor: color,
                    color: textColorIsBlack ? 'black' : 'white',
                  } : {}}
                >
                  <span
                    className={`mr-3 ${isActive ? (textColorIsBlack ? 'text-black' : 'text-white') : 'text-gray-500 group-hover:text-blue-700'}`}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <LogOut size={18} className="mr-3 text-gray-700"/>
              <LogoutButton className="text-gray-700 w-fit text-left"/>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}