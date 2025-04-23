'use client';

import React, { useEffect, useState } from 'react';
import NotesLibrary from '@/components/notes/NotesLibrary';
import { redirect } from 'next/navigation';
import VideoPlayerModal from '@/components/notes/NotesViewer/modal';
import Loader from '@/components/ui/Loader';


export default function StudentNotesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [studentData, setStudentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    redirect('/login');
                    return;
                }

                const user = JSON.parse(userData);
                if (user.role !== 'STUDENT' || !user.studentId) {
                    setError('Access denied. Student account required.');
                    return;
                }

                const response = await fetch(`/api/students/${user.studentId}?includeClassSection=true`);
                if (!response.ok) throw Error('Failed to fetch student data');

                const studentData = await response.json();
                setStudentData(studentData);
            } catch (err) {
                console.error('Error loading student data:', err);
                setError('Failed to load student data');
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
        const { pdfUrl, noteId, initialVideoData } = noteProps;
        const NotesViewer = React.lazy(() => import('@/components/notes/NotesViewer'));
        setModalContent(
            <div className="container mx-auto p-4 bg-gray-50">
                <NotesViewer
                    pdfUrl={pdfUrl}
                    noteId={noteId}
                    initialVideoData={initialVideoData}
                />
            </div>
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    if (isLoading) {
        return (

            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Loader size="large" />
            </div>

        );
    }

    if (error) {
        return (

            <div className="p-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>

        );
    }

    if (!studentData) {
        return (

            <div className="p-8">
                <div className="text-gray-500">Student data not found</div>
            </div>

        );
    }

    if (!studentData.classEnrollments || studentData.classEnrollments.length === 0 ||
        studentData.enrollmentStatus !== 'ACTIVE') {
        return (

            <div className="p-8">
                <div className="text-gray-500">No active class enrollment found</div>
            </div>

        );
    }

    const currentEnrollment = studentData.classEnrollments[0];

    if (!currentEnrollment.classSection) {
        return (

            <div className="p-8">
                <div className="text-gray-500">Class section data not found</div>
            </div>

        );
    }

    return (

        <div className="p-8">
            <div className="mb-8">
                {/* <h1 className="text-gray-400 text-sm mb-1">Student Dashboard / Notes Library</h1> */}
                {/* <h2 className="text-2xl font-semibold">Notes Library</h2> */}
            </div>
            <NotesLibrary
                studentId={studentData.id}
                studentName={studentData.user.name || ''}
                classSectionId={currentEnrollment.classSectionId}
                batchName={studentData.batch?.batchName || ''}
                sectionName={currentEnrollment.classSection.sectionName || ''}
                openNoteInModal={openNoteInModal}
            />
            <VideoPlayerModal
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                {modalContent}
            </VideoPlayerModal>
        </div>

    );
}

