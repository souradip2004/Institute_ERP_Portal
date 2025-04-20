'use client';

import React, { useEffect, useState } from 'react';
import NotesLibrary from '@/components/notes/NotesLibrary';
import { redirect } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function StudentNotesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [studentData, setStudentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user data from localStorage
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

                // Fetch student data with related entities
                const response = await fetch(`/api/students/${user.studentId}?includeClassSection=true`);
                if (!response.ok) throw new Error('Failed to fetch student data');

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

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (!studentData) {
        return <div className="p-4">Student data not found</div>;
    }

    // Check for active enrollment
    if (!studentData.classEnrollments || studentData.classEnrollments.length === 0 ||
        studentData.enrollmentStatus !== 'ACTIVE') {
        return <div className="p-4">No active class enrollment found</div>;
    }

    // Get the current class section from enrollments
    const currentEnrollment = studentData.classEnrollments[0];

    if (!currentEnrollment.classSection) {
        return <div className="p-4">Class section data not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <NotesLibrary
                studentId={studentData.id}
                studentName={studentData.user.name || ''}
                classSectionId={currentEnrollment.classSectionId}
                batchName={studentData.batch?.batchName || ''}
                sectionName={currentEnrollment.classSection.sectionName || ''}
            />
        </div>
    );
} 