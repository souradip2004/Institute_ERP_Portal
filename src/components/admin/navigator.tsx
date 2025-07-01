"use client";
import { useState, useEffect, useRef } from "react";
import AddClass from "./AddClass";
import ViewTeachers from "./ViewTeachersComponent";
import AddStudent from "./AddStudent";
import StudentDetail from "./ViewStudentPage";
import ViewClassSectionPage from "./ViewClassSectionPage";
import AddTeacher from "@/components/admin/AddTeachers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import CostManagementPage from "./CostManagement";
import CreateAttendance from "./CreateAttendance";
import axios from "axios";
// Lucide Icons
import {
  BookOpenCheck,
  Users2,
  GraduationCap,
  CalendarCheck2,
  Bell,
  Menu, // Added for mobile toggle
  X, // Added for mobile close
  RotateCw, // Icon for landscape mode
  Monitor,
  User, // Icon for desktop mode
} from "lucide-react";

interface NavigatorProps {
  id: string;
  userId: string;
  logo: string | null; // Logo URL or null if not available
  name: string
  primaryColor: string
}

const Navigator = ({ id, userId, logo, name, primaryColor }: NavigatorProps) => {
  const [activeComponent, setActiveComponent] = useState<string>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Initial state: sidebar is open
  const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view
  const [showOrientationPopup, setShowOrientationPopup] = useState(false); // State for the popup
  const hasShownPopup = useRef(false); // Ref to track if popup has been shown in current session
  const pathname = usePathname();
  const [color, setColor] = useState<string>(primaryColor);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    const temp = localStorage.getItem('primaryColor');
    console.log('temp--- ', temp);
    if (temp) {
      setColor(temp);
    }
  },);

  useEffect(() => {
    // Client-side execution check
    if (typeof window !== "undefined") {
      const checkMobile = () => window.innerWidth < 768; // Tailwind's 'md' breakpoint
      const checkPortrait = () => window.innerHeight > window.innerWidth; // Check if in portrait mode

      const handleResize = () => {
        const mobile = checkMobile();
        const portrait = checkPortrait();

        setIsMobileView(mobile);
        // Do not automatically close sidebar for desktop; let the toggle control it
        // setIsSidebarOpen(!mobile); // <-- REMOVE OR MODIFY THIS LINE

        // Show popup only if on mobile, in portrait, and hasn't been shown yet
        if (mobile && portrait && !hasShownPopup.current) {
          setShowOrientationPopup(true);
          hasShownPopup.current = true; // Mark as shown for this session
        } else if (!mobile || !portrait) {
          // Hide popup if not on mobile or not in portrait (e.g., landscape or desktop)
          setShowOrientationPopup(false);
        }
      };

      // Set initial state
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

  }, []);

  useEffect(() => {
    setColor(`bg-[${primaryColor}]`);
    console.log('Color--- ', color);
  }, [primaryColor]);


  const renderComponent = () => {
    switch (activeComponent) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <AddTeacher id={id} />
            <ViewTeachers id={id} />
          </div>
        );
      case "Student":
        return (
          <div className="space-y-6">
            <AddStudent id={id} />
            <StudentDetail id={id} />
          </div>
        );
      case "Teacher": // Renamed to "Class Management" in navItems
        return (
          <div className="space-y-6">
            <AddClass id={id} userid={userId} />
            <ViewClassSectionPage id={id} />
          </div>
        );
      case "CostManagement":
        return (
          <div className="space-y-6">
            <CostManagementPage id={id} />
          </div>
        );
      case "Attendance":
        return (
          <div className="space-y-6">
            <CreateAttendance />
          </div>
        );
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  // Function to close sidebar on navigation (for mobile)
  const handleNavLinkClick = (componentName?: string) => {
    if (componentName) {
      setActiveComponent(componentName);
    }
    // Only close sidebar on navigation if it's currently open AND it's mobile view
    if (isMobileView && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    {
      name: "Teacher Management",
      component: "Dashboard",
      icon: <Users2 size={18} />,
    },
    {
      name: "Class Management",
      component: "Teacher",
      icon: <BookOpenCheck size={18} />,
    },
    {
      name: "Student Management",
      component: "Student",
      icon: <GraduationCap size={18} />,
    },
    {
      name: "Attendance Management",
      component: "Attendance",
      icon: <CalendarCheck2 size={18} />,
    },
    {
      name: "Cost Management",
      component: "CostManagement",
      icon: <Bell size={18} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Toggle Button (visible only on mobile when sidebar is closed) */}
      {isMobileView && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)} // Open sidebar
          className="fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-md md:hidden shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Desktop Toggle Button (visible only on desktop) */}
      {!isMobileView && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} // Toggle sidebar
          className={`fixed top-4 z-[60] p-2 bg-blue-600 text-white rounded-md shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? "left-68" : "left-4" // Position based on sidebar state
            }`}
        >
          {!isSidebarOpen && <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-[55] transition-transform duration-300 ease-in-out flex flex-col justify-between 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-64`}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center mb-8 justify-between">
            <Image
              src={logo ? logo : "/logo.png"}
              alt="Logo"
              width={logo ? 40 : 160}
              height={40}
              className="object-contain"
            />
            {logo && (
              <span className="text-base font-semibold text-gray-800 ml-2 whitespace-normal break-words max-w-[8rem] leading-tight">{name}</span>
            )}
            {/* Close button for mobile inside sidebar (or desktop if sidebar is open) */}
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 " // Only show on mobile within sidebar
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.href
                ? pathname === item.href
                : activeComponent === item.component;

              const commonClasses =
                "flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium group"; // Added group for hover effects
              const activeClasses =
                `bg-blue-600 text-white shadow-md`; // Darker gradient, shadow
              const inactiveClasses =
                "text-gray-700 hover:bg-gray-100 hover:text-blue-600"; // Lighter hover

              return item.href ? (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavLinkClick}
                  className={`${commonClasses} ${isActive ? `bg-[${color}] text-white shadow-md` : inactiveClasses
                    }`}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  <span
                    className={`mr-3 ${isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
                      }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleNavLinkClick(item.component)}
                  className={`${commonClasses} ${isActive ? `bg-[${color}] text-white shadow-md` : inactiveClasses
                    } w-full text-left`}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  <span
                    className={`mr-3 ${isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
                      }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mb-8 p-3 ">
          <Link href={"/a/dashboard"}
            className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-100 
                text-gray-500 bg-gray-100 hover:bg-gray-200 
            }`}
          >
            <span className="flex items-center justify-center w-6 h-6">
              <User size={20} />
            </span>
            <span className={`ml-4 font-medium`}>My Profile</span>

          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out
          ${!isMobileView && isSidebarOpen ? "ml-64" : "ml-0"}
          ${isMobileView && !isSidebarOpen ? "pl-4 pr-4 pt-16" : ""}
          ${isMobileView && isSidebarOpen ? "overflow-hidden max-h-screen" : ""}
        `}
      >
        {renderComponent()}
      </main>

      {/* --- Orientation Popup --- */}
      {showOrientationPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div
            className="relative bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-fade-in-up">
            <button
              onClick={() => setShowOrientationPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close message"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div
                className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-full inline-flex justify-center items-center mb-4 shadow-md">
                <RotateCw size={36} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Optimal Viewing Experience
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                For the best experience, please rotate your device to{" "}
                <span className="font-semibold text-blue-700">
                  landscape mode
                </span>{" "}
                or use Desktop View.
              </p>
            </div>

            <div className="flex justify-center items-center space-x-4 text-gray-500 text-sm">
              <div className="flex flex-col items-center">
                <RotateCw size={24} className="mb-1 text-gray-400" />
                <span>Landscape</span>
              </div>
              <span>/</span>
              <div className="flex flex-col items-center">
                <Monitor size={24} className="mb-1 text-gray-400" />
                <span>Desktop View</span>
              </div>
            </div>

            <button
              onClick={() => setShowOrientationPopup(false)}
              className="mt-6 w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Custom animation for the popup */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Navigator;