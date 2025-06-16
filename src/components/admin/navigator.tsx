"use client";
import { useState, useEffect } from "react";
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
// Lucide Icons
import {
  BookOpenCheck,
  Users2,
  GraduationCap,
  CalendarCheck2,
  Bell,
  Menu, // Added for mobile toggle
  X,    // Added for mobile close
} from "lucide-react";

interface NavigatorProps {
  id: string;
  userId: string;
}

const Navigator = ({ id, userId }: NavigatorProps) => {
  const [activeComponent, setActiveComponent] = useState<string>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar's open/close
  const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view
  const pathname = usePathname();

  useEffect(() => {
    // Client-side execution check
    if (typeof window !== 'undefined') {
      const checkMobile = () => window.innerWidth < 768; // Tailwind's 'md' breakpoint
      setIsMobileView(checkMobile());
      setIsSidebarOpen(!checkMobile()); // Set initial sidebar state: open on desktop, closed on mobile

      const handleResize = () => {
        setIsMobileView(checkMobile());
        // Adjust sidebar state on resize: open for desktop, close for mobile
        setIsSidebarOpen(!checkMobile());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  // Function to close sidebar on navigation (for mobile)
  const handleNavLinkClick = (componentName?: string) => {
    if (componentName) {
      setActiveComponent(componentName);
    }
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { name: "Teacher Management", component: "Dashboard", icon: <Users2 size={18} /> },
    { name: "Class Management", component: "Teacher", icon: <BookOpenCheck size={18} /> },
    { name: "Student Management", component: "Student", icon: <GraduationCap size={18} /> },
    { name: "Attendance Management", href: "/a/create-attendance-session", icon: <CalendarCheck2 size={18} /> },
    { name: "Cost Management", component: "CostManagement", icon: <Bell size={18} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Toggle Button (visible only on mobile) */}
      {isMobileView && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-md md:hidden" // Moved to right
        >
          {!isSidebarOpen && <Menu size={24} />}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobileView && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-50 md:hidden" // z-index between toggle and sidebar
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md border-r border-gray-200 z-[55] transition-transform duration-300 ease-in-out
          ${isMobileView && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobileView ? 'w-64' : 'w-64 md:translate-x-0'} `}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <Image
              src="https://media-hosting.imagekit.io/ec92e4e35be64d63/navlogo.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=l6NqfsMDqkEtJKGne9jQGByswyVWZVOrHU2GGaayrbu4NTBQuKV5FZ4c-II7yle67m~uWVboQmHUb3kogbqNjNUkwJpSK5md7ufqh-ru1VYWk88f8SjXjRfRFxxxMayQzi3Bnoc4iLtuaL25zHXMpKaZSnTPwgbykC9UK2ZVRvwMz6aUFc7eTfDXJoz1tITJ1C2SCfffvvc9Z~1g45cQd0Gl447yTrqqw~XEAl1ekj4Wrnf5sqq6dvFgYpdciK~QUYl8olW9UAea6ZKHRAw2W6sqM0cAjyzxDbHS4GrN7muT9zd5pvkPwbt~A50mkyWKN68FDikIyfwnrqp989YQyw__"
              alt="Logo"
              width={160}
              height={40}
              className="object-contain"
            />
            {/* Close button for mobile inside sidebar */}
             {isMobileView && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-auto p-2 text-gray-500 hover:text-gray-700" // ml-auto pushes it to the right
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

              const commonClasses = "flex items-center px-4 py-2 rounded-md transition-colors text-sm font-medium";
              const activeClasses = "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
              const inactiveClasses = "text-gray-700 hover:bg-gray-100";

              return item.href ? (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavLinkClick} // Call to close sidebar
                  className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleNavLinkClick(item.component)} // Call to close sidebar
                  className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses} w-full text-left`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out
          ${isMobileView ? 'ml-0' : 'ml-64'} /* Desktop: ml-64; Mobile: ml-0 */
          ${isMobileView && !isSidebarOpen ? 'pl-4 pr-4 pt-16' : ''} /* Mobile closed padding (adjust pt based on toggle button height) */
          ${isMobileView && isSidebarOpen ? 'overflow-hidden max-h-screen' : ''} /* Prevent scrolling main content when sidebar is open */
        `}
      >
        {renderComponent()}
      </main>
    </div>
  );
};

export default Navigator;