'use client';
import TeacherSidebar from './TeacherSidebar';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto ml-64 p-6">
        {children}
      </main>
    </div>
  );
} 