'use client';

import React, {useEffect, useState, Suspense} from 'react';
import NotesLibrary from '@/components/notes/NotesLibrary';
import {redirect} from 'next/navigation';
import VideoPlayerModal from '@/components/notes/NotesViewer/modal';
import Loader from '@/components/ui/Loader';

export default function StudentNotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModal] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          redirect('/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'STUDENT') {
          setError('Access denied. Student account required.');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/students/${user.studentId}?includeClassSection=true`);
        if (!response.ok) throw new Error('Failed to fetch student data');

        const studentData = await response.json();
        setStudentData(studentData);
      } catch (err: any) {
        setError(err.message || 'Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openNoteInModal = (noteProps: {
    pdfUrl?: string;
    noteId?: string;
    initialVideoData?: any;
  }) => {
    const NotesViewer = React.lazy(() => import('@/components/notes/NotesViewer'));

    setModal(
      <Suspense fallback={<Loader size="medium" message="Loading note content..."/>}>
        <div className="p-4 sm:p-6 bg-white min-h-full max-h-[90vh] overflow-y-auto">
          <NotesViewer {...noteProps} />
        </div>
      </Suspense>
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModal(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader size="large" message="Loading notes..."/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">Error!</strong>
          {error}
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">Information</strong>
          Student data not found. Please try again later.
        </div>
      </div>
    );
  }

  if (
    !studentData.classEnrollments ||
    studentData.classEnrollments.length === 0 ||
    studentData.enrollmentStatus !== 'ACTIVE'
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">No Active Enrollment</strong>
          You are not currently enrolled in any active classes. Please contact your administrator.
        </div>
      </div>
    );
  }

  const currentEnrollment = studentData.classEnrollments[0];

  if (!currentEnrollment.classSection) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">Data Incomplete</strong>
          Class section data for your enrollment was not found. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-2 px-4 sm:mb-6 max-w-screen-xl mx-auto mt-9"> {/* Added max-w and mx-auto */}
        {/*<p className="text-gray-500 text-xs sm:text-sm mb-1">Dashboard / Notes Library</p>*/}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Notes Library</h2>
      </div>

      {/* NotesLibrary Component */}
      <div className="max-w-screen-xl mx-auto"> {/* Added max-w and mx-auto */}
        <NotesLibrary
          studentId={studentData.id}
          studentName={studentData.user.name || ''}
          classSectionId={currentEnrollment.classSectionId}
          batchName={studentData.batch?.batchName || ''}
          sectionName={currentEnrollment.classSection.sectionName || ''}
          openNoteInModal={openNoteInModal}
        />
      </div>

      {/* VideoPlayerModal - typically handles its own centering/width */}
      <VideoPlayerModal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </VideoPlayerModal>
    </div>
  );
}
