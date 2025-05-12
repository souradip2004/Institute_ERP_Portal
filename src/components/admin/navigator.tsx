"use client";
import { useState } from "react";
import AddClass from "./AddClass";
import ViewTeachers from "./ViewTeachersComponent"
import AddStudent from "./AddStudent";
import StudentDetail from "./ViewStudentPage";
import ViewClassSectionPage from "./ViewClassSectionPage"
import AddTeacher from "@/components/admin/AddTeachers";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { LogoutButton } from "@/components/auth/logout-button";

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
      case "Users":
        return <div>Users Content</div>;
      case "Settings":
        return <div>Settings Content</div>;
      case "Attendance":
        return <div>Attendance Content</div>;
      case "Notifications":
        return <div>Notifications Content</div>;
      case "Teacher":
        return (
          <div className="space-y-6">
                        <AddClass id={id} userid={userId} />
            <ViewClassSectionPage id={id} />
          </div>
        );
      case "Student":
        return (
          <div className="space-y-6">
            <AddStudent id={id} />
            <StudentDetail id={id} />
          </div>
        );
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  const navItems = [
    { name: "Teacher Management", component: "Dashboard", icon: "👨‍🏫" },
        { name: "Class Management", component: "Teacher", icon: "🏫" },
    { name: "Student Management", component: "Student", icon: "👨‍🎓" },
    // { name: "Attendance Management", component: "Attendance", icon: "📋" },
    // { name: "Notifications", component: "Notifications", icon: "🔔" },
    { name: "Create Attendance Sessions", href: "/a/create-attendance-session", icon: "📅" },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <div className="mb-8">
            <Link href="/a/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AI Classroom</span>
            </Link>
          </div>
          
          <nav onClick={() => console.log("button clicked")} className="space-y-1">
            {navItems.map((item)  => {
              const isActive = item.href 
                ? pathname === item.href 
                : activeComponent === item.component;
              
              return item.href ? (
                <Link
                  onClick={() => console.log("link clicked")}
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => setActiveComponent(item.component)}
                  className={`w-full flex items-center px-4 py-3 text-base rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          {/* <div className="flex items-center">
            <span className="mr-3">🚪</span>
            <LogoutButton className="text-gray-700 w-full text-left" />
          </div> */}
        </div>
      </aside>
      
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {renderComponent()}
      </main>
    </div>
  );
};

export default Navigator;