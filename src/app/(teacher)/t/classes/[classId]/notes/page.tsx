// Server component
import { Suspense } from 'react';
import TeacherNotesClient from './TeacherNotesClient';

export default async function TeacherNotesPage({ params }: { params: { classId: string } }) {
    const { classId } = await params;

    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <TeacherNotesClient classId={classId} />
        </Suspense>
    );
} 