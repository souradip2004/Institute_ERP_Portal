// src/components/teacher/TeacherLayout.js (or .tsx)
// src/components/teacher/TeacherLayout.js (or .tsx)
import TeacherSidebar from './TeacherSidebar'; // Adjust path as necessary

export default function TeacherLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
            <TeacherSidebar />

      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}