'use client';

import TeacherLayout from '@/components/teacher/TeacherLayout';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      

     
        <TeacherLayout>
          {children}
        </TeacherLayout>
   
    </>
  );
}
