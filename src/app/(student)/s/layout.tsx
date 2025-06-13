'use client';
import StudentLayout from '@/components/student/StudentLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            
  <head>
        <meta name="viewport" content="width=1024, user-scalable=no" />
        <title>Admin</title>
      </head>
        <StudentLayout>
            
            {children}
        </StudentLayout>
        </>
    );
} 