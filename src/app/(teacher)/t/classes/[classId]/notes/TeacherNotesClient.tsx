'use client';

import React, { useEffect, useState } from 'react';
import NotesManagement from '@/components/notes/NotesManagement';
import { redirect } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function TeacherNotesClient({ classId }: { classId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [teacherData, setTeacherData] = useState<any>(null);
    const [classData, setClassData] = useState<any>(null);
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
                if (user.role !== 'TEACHER' || !user.teacherId) {
                    setError('Access denied. Teacher account required.');
                    return;
                }

                // Fetch teacher data
                const teacherResponse = await fetch(`/api/teachers/${user.teacherId}`);
                if (!teacherResponse.ok) throw new Error('Failed to fetch teacher data');
                const teacherData = await teacherResponse.json();
                setTeacherData(teacherData);

                // Fetch class section data
                const classResponse = await fetch(`/api/class-sections/${classId}`);
                if (!classResponse.ok) throw new Error('Failed to fetch class data');
                const classData = await classResponse.json();
                setClassData(classData);

                // Verify teacher has access to this class section
                // const hasAccess = await AuthUtils.isTeacherAssignedToClassSection(user.teacherId, classId);
                // if (!hasAccess) {
                //     setError('You do not have access to this class section');
                //     return;
                // }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load required data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [classId]);

    // if (isLoading) {
    //     return <div className="p-4"></div>;

    // }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader size="large" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (!teacherData) {
        return <div className="p-4">Teacher data not found</div>;
    }

    if (!classData) {
        return <div className="p-4">Class section not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <NotesManagement
                teacherId={teacherData.id}
                teacherName={teacherData.user.name || ''}
                classSectionId={classId}
                className={`Class ${classData.batch.batchName} - ${classData.sectionName}`}
                batchName={classData.batch.batchName}
                sectionName={classData.sectionName}
            />
        </div>
    );
} 