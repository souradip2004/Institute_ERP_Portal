// Server component
import { Suspense } from 'react';
import TeacherNotesClient from './TeacherNotesClient';

export default function TeacherNotesPage({ params }: { params: { classId: string } }) {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <TeacherNotesClient classId={params.classId} />
        </Suspense>
    );
} 