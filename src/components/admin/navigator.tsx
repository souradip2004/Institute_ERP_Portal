"use client";
import { useState } from "react";
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
  Video,
} from "lucide-react";

interface NavigatorProps {
  id: string;
  userId: string;
}

const Navigator = ({ id, userId }: NavigatorProps) => {
  const [activeComponent, setActiveComponent] = useState<string>("Dashboard");
  const pathname = usePathname();

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
      case "Teacher":
        return (
          <div className="space-y-6">
            <AddClass id={id} userid={userId} />
            <ViewClassSectionPage id={id} />
          </div>

        );
      case "CostManagement":
      return(
                  <div className="space-y-6">
           <CostManagementPage id={id}/>
          </div>
      )
      
      default:
        return <div>Select an option from the sidebar</div>;
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-white shadow-md fixed top-0 left-0 border-r border-gray-200">
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center mb-8">
<Image
            src="https://media-hosting.imagekit.io/ec92e4e35be64d63/navlogo.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=l6NqfsMDqkEtJKGne9jQGByswyVWZVOrHU2GGaayrbu4NTBQuKV5FZ4c-II7yle67m~uWVboQmHUb3kogbqNjNUkwJpSK5md7ufqh-ru1VYWk88f8SjXjRfRFxxxMayQzi3Bnoc4iLtuaL25zHXMpKaZSnTPwgbykC9UK2ZVRvwMz6aUFc7eTfDXJoz1tITJ1C2SCfffvvc9Z~1g45cQd0Gl447yTrqqw~XEAl1ekj4Wrnf5sqq6dvFgYpdciK~QUYl8olW9UAea6ZKHRAw2W6sqM0cAjyzxDbHS4GrN7muT9zd5pvkPwbt~A50mkyWKN68FDikIyfwnrqp989YQyw__"
            alt="Logo"
            width={160}
            height={40}
            className="object-contain"
          />          </div>

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
                  className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => setActiveComponent(item.component)}
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
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {renderComponent()}
      </main>
    </div>
  );
};

export default Navigator;
