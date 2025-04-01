// components/admin/Sidebar.tsx
"use client";

// components/admin/Sidebar.tsx
export default function Sidebar({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  return (
    <div className="w-1/4 p-4 bg-gray-100 h-screen">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <ul className="space-y-2">
        {["classManagement", "addTeacher", "addStudent", "addClass", "viewTeachers", "viewStudents", "viewClasses"].map((section) => (
          <li
            key={section}
            onClick={() => setActiveSection(section)}
            className="cursor-pointer hover:text-blue-500"
          >
            {section.replace(/([A-Z])/g, " $1").trim()}
          </li>
        ))}
      </ul>
    </div>
  );
}

