'use client';
import StudentLayout from '@/components/student/StudentLayout';

export default function Layout({children}: { children: React.ReactNode }) {
  return (
    <>

      <div>
        <title>Admin</title>
      </div>
      <StudentLayout>
        {children}
      </StudentLayout>
    </>
  );
} 