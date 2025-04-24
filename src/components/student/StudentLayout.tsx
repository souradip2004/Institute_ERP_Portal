'use client';
import React from 'react';
import Sidebar from './Sidebar';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
} 