'use client';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
  IndianRupeeIcon,
  LogOut,
  Menu, // Added for the hamburger icon
  X // Added for the close icon
} from 'lucide-react';
import Image from 'next/image';
import { FaRegLightbulb } from "react-icons/fa";

interface SidebarProps {
  onSidebarToggle: (isOpen: boolean) => void; // Callback to inform parent of sidebar state
}

export default function Sidebar({ onSidebarToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Default to open for desktop, adjust based on initial screen size
  const [isMobile, setIsMobile] = useState(false); // State to track mobile view
  const [institution, setImstitution] = useState(null);
  const [color, setColor] = useState<string>("");
  const [institutionType, setInstitutionType] = useState<string | null>(null);
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const data = JSON.parse(localStorage.getItem("user"))?.institutionId;
      setInstitutionType(JSON.parse(localStorage.getItem("user")).institutionType || null);
      const fetchInstitute = async () => {
        const institutionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${data}`, {
          cache: "no-store",
        });
        let institutionData = await institutionRes.json();
        setImstitution(institutionData)
        setColor(institutionData.primaryColor)
      }
      fetchInstitute();
    }
  }, [])

  useEffect(() => {
    console.log('color--- ', color);
    localStorage.setItem('primaryColor', color);
    const temp = localStorage.getItem('primaryColor');
    console.log('temp--- ', temp);
    if (temp) {
      setColor(temp);
    }
  }, [color]);

  // Memoize the callback to prevent unnecessary re-renders in parent
  const memoizedOnSidebarToggle = useCallback(
    (openStatus: boolean) => {
      onSidebarToggle(openStatus);
    },
    [onSidebarToggle]
  );

  useEffect(() => {
    // Client-side execution check
    if (typeof window !== 'undefined') {
      // Determine initial screen size
      const checkMobile = () => window.innerWidth < 768; // Tailwind's 'md' breakpoint
      const initialIsMobile = checkMobile(); // Get initial mobile status
      setIsMobile(initialIsMobile);
      setIsOpen(!initialIsMobile); // If mobile, start closed; if desktop, start open
      memoizedOnSidebarToggle(!initialIsMobile); // Inform parent about initial state

      // Add event listener for window resize
      const handleResize = () => {
        const currentIsMobile = checkMobile();
        setIsMobile(currentIsMobile);
        // If transitioning from mobile to desktop, open sidebar
        // If transitioning from desktop to mobile, close sidebar
        setIsOpen(!currentIsMobile);
        memoizedOnSidebarToggle(!currentIsMobile); // Inform parent
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [memoizedOnSidebarToggle]); // Add memoized callback to dependency array

  // Effect to inform parent whenever isOpen changes (for user-initiated toggles)
  useEffect(() => {
    memoizedOnSidebarToggle(isOpen);
  }, [isOpen, memoizedOnSidebarToggle]);

  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsOpen(false); // Close sidebar after navigation on mobile
    }
  };

  const menuItems = [
    { title: 'My Classes', href: '/s/dashboard', icon: <LayoutDashboard size={18} /> },
    { title: 'Notes Library', href: '/s/notes', icon: <NotebookText size={18} /> },
    { title: institutionType?.includes("College")?'Assignments':"Homeworks", href: '/s/assignments', icon: <BookOpenCheck size={18} /> },
    { title: 'Exams and Reports', href: '/s/exams', icon: <FileText size={18} /> },
    { title: 'Mentorship', href: '/s/mentorship', icon: <Sparkles size={18} /> },
    { title: 'Report Card', href: '/s/report', icon: <BarChart3 size={18} /> },
    { title: 'Ask Teacher', href: '/s/ask-teacher', icon: <MessageSquareQuoteIcon size={18} /> },
    { title: 'Smart Resources', href: '/s/smart-resources', icon: <FaRegLightbulb size={18} /> },
    { title: 'Fees', href: '/s/fees', icon: <IndianRupeeIcon size={18} /> },
    {title:"Notices", href:'/s/notice', icon:<FileText size={18} />},
  ];

  return (
    <>
      {/* Mobile Toggle Button (outside the sidebar) */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md md:hidden" // md:hidden hides it on desktop
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Desktop Toggle Button (outside the sidebar) */}
      {!isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed top-4 p-2 bg-blue-600 text-white rounded-md shadow-lg z-50 transition-all duration-300 ease-in-out
            ${isOpen ? 'left-68' : 'left-4'}`} /* Adjust left position based on sidebar state */
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {!isOpen && <Menu size={24} />}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" // z-index between toggle and sidebar
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} /* Controls slide in/out */
          w-64`} /* Removed md:translate-x-0 from here */
      >
        <div className="p-4 flex flex-col h-full"> {/* Added flex-col and h-full for layout */}
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-between"> {/* Added justify-between */}
            <Image
              src={institution?.logoUrl && institution.logoUrl }
              alt="Logo"
              width={(institution && institution.logoUrl) ? 40 : 160}
              height={40}
              className="object-contain"
            />
            {(institution && institution.logoUrl) && (
              <span
                className="text-sm font-semibold text-gray-800 ml-2 whitespace-normal break-words w-full block leading-tight">{institution?.name}</span>
            )}
            {/* Close button inside sidebar (visible when sidebar is open) */}
            {isOpen && ( // The close button inside the sidebar should always be visible when the sidebar is open
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation - now scrollable if content overflows */}
          <nav className="space-y-1 flex-1 overflow-y-auto pr-2"> {/* Added flex-1 and overflow-y-auto */}
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/'));

            
              const isLightColor = (hex: string) => {
  // A simple way to check for lightness is to convert to RGB and get the luminance.
  // This is a basic approach. For more robust checks, you could use a library.
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  // Using the WCAG formula for relative luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6; // Adjust this threshold as needed
};

// ... inside your component
const commonClasses = "flex items-center px-4 py-3 text-base rounded-md transition-colors group";
const activeClasses = `font-medium`; // Text color will be set dynamically
const inactiveClasses = "text-gray-700 hover:bg-gray-100";

return (
  <Link
    key={item.title}
    href={item.href as any}
    onClick={handleNavLinkClick}
    className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
    style={isActive ? { backgroundColor: color, color: isLightColor(color) ? 'black' : 'white' } : undefined}
  >
    <span className={`mr-3 ${isActive ? (isLightColor(color) ? 'text-black' : 'text-white') : 'text-gray-500 group-hover:text-blue-700'}`}>
      {item.icon}
    </span>
    <span style={isActive ? { color: isLightColor(color) ? 'black' : 'white' } : undefined}>
      {item.title}
    </span>
  </Link>
);
            })}
          </nav>

          {/* Logout Section - now sticky at the bottom */}
          <div
            className="mt-auto p-4 border-t border-gray-200 sticky bottom-0 bg-white z-10"> {/* Added sticky, bottom-0, bg-white, z-10 */}
            <div className="flex items-center">
              <LogOut size={18} className="mr-3 text-gray-700" />
              <LogoutButton className="text-gray-700 w-fit text-left" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}