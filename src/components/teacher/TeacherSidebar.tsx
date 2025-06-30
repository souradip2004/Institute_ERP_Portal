'use client';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback import
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
  LogOut,
  Menu, // Added for the hamburger icon
  X // Added for the close icon
} from 'lucide-react';

import Image from 'next/image';
import { FaRegLightbulb } from "react-icons/fa";

interface TeacherSidebarProps {
  onSidebarToggle: (isOpen: boolean) => void; // Callback to inform parent of sidebar state
}

export default function TeacherSidebar({ onSidebarToggle }: TeacherSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true); // Changed: Default to OPEN for desktop initially
  const [isMobile, setIsMobile] = useState(false); // State to track mobile view
  const [institution, setImstitution] = useState(null);
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const data = JSON.parse(localStorage.getItem("user"))?.institutionId;
      const fetchInstitute = async () => {
        const institutionRes = await fetch(`http://localhost:3000/api/institutions/${data}`, {
          cache: "no-store",
        });
        let institutionData = await institutionRes.json();
        setImstitution(institutionData)
        setColor(institutionData.primaryColor);
        console.log('color--- ', color);
      }
      fetchInstitute();

    }
  }, [])
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

      // Determine initial screen size
      const checkMobile = () => window.innerWidth < 768; // Tailwind's 'md' breakpoint
      const initialIsMobile = checkMobile();
      setIsMobile(initialIsMobile);
      // Set to open for desktop, closed for mobile
      setIsOpen(!initialIsMobile);
      memoizedOnSidebarToggle(!initialIsMobile); // Inform parent about initial state

      // Add event listener for window resize
      const handleResize = () => {
        const currentIsMobile = checkMobile();
        setIsMobile(currentIsMobile);

        // This logic ensures consistent behavior on resize:
        // If it becomes mobile, it will be closed.
        // If it becomes desktop, it will be open.
        setIsOpen(!currentIsMobile);
        memoizedOnSidebarToggle(!currentIsMobile); // Inform parent
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [memoizedOnSidebarToggle]); // Use memoized callback in dependency array

  // Effect to inform parent whenever isOpen changes (for user-initiated toggles)
  useEffect(() => {
    memoizedOnSidebarToggle(isOpen);
  }, [isOpen, memoizedOnSidebarToggle]);

  const handleAssignmentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/t/assignments`);
    // Close sidebar after navigation only if it's mobile view
    if (isMobile) setIsOpen(false);
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/t/notes`);
    // Close sidebar after navigation only if it's mobile view
    if (isMobile) setIsOpen(false);
  };

  const handleNavLinkClick = () => {
    // Close sidebar after navigation only if it's mobile view
    if (isMobile) setIsOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', href: '/t/dashboard', icon: <LayoutDashboard size={18} />, onClick: handleNavLinkClick },
    { name: 'Exams', href: `/t/classes/${classId}/exams`, icon: <PenLine size={18} />, onClick: handleNavLinkClick },
    { name: 'Assignments', href: '#', icon: <BookOpenCheck size={18} />, onClick: handleAssignmentsClick },
    { name: 'Notes', href: '#', icon: <NotebookText size={18} />, onClick: handleNotesClick },
    { name: 'Attendance', href: '/t/attendance', icon: <CalendarCheck2 size={18} />, onClick: handleNavLinkClick },
    { name: 'Classes', href: '/t/classes', icon: <Users2 size={18} />, onClick: handleNavLinkClick },
    { name: 'Copy checking', href: '/t/pythonCopyChecking', icon: <FileText size={18} />, onClick: handleNavLinkClick },
    { name: 'Smart Resources', href: '/t/smart-resources', icon: <FaRegLightbulb size={18} />, onClick: handleNavLinkClick },
  ];

  return (
    <>
      {/* Mobile Toggle Button (outside the sidebar, visible only on mobile when sidebar is NOT open) */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)} // Open sidebar
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Desktop Toggle Button (outside the sidebar, visible only on desktop) */}
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
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Logo and Close Button (always visible when sidebar is open) */}
          <div className="mb-8 flex items-center justify-between">
            <Image
              src={(institution && institution.logoUrl) ? institution.logoUrl : "/logo.png"}
              alt="Logo"
              width={institution ? 40 : 160}
              height={40}
              className="object-contain"
            />
            {(institution && institution.logoUrl) && (
              <span className="text-sm font-semibold text-gray-800 ml-2 whitespace-normal break-words w-full block leading-tight">{institution?.name}</span>
            )}
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
          <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
            {navItems.map((item) => {
              const isAssignments = item.name === 'Assignments';
              const isNotes = item.name === 'Notes';

              let isActive = false;
              if (isAssignments) {
                isActive = !!pathname?.includes('/assignments');
              } else if (isNotes) {
                isActive = !!pathname?.includes('/notes');
              } else if (item.name === 'Classes') {
                // Only active if on the classes list or a class detail page, but not on subpages like /exams, /assignments, /notes
                isActive =
                  pathname === '/t/classes' ||
                  (!!pathname &&
                    /^\/t\/classes\/[^/]+$/.test(pathname) &&
                    !pathname.includes('/exams') &&
                    !pathname.includes('/assignments') &&
                    !pathname.includes('/notes'));
              } else if (item.name === 'Exams') {
                isActive = !!pathname?.includes('/exams');
              } else {
                isActive = !!pathname?.startsWith(item.href);
              }

              const commonClasses = "flex items-center px-4 py-3 text-base rounded-md transition-colors group";
              const activeClasses = `bg-[${color}] text-white font-medium`;
              const inactiveClasses = "text-gray-700 hover:bg-gray-100";

              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  onClick={item.onClick}
                  className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-700'}`}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout - now sticky at the bottom */}
          <div className="mt-auto p-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
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