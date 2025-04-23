// Server component
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import TeacherNotesClient from './TeacherNotesClient';

export default async function TeacherNotesPage({ params }: { params: { classId?: string } }) {
    // When accessed directly from /t/notes, we need to redirect to the class selection page
    // or use a default behavior
    
    // For server component, we can use the redirect function directly
    redirect('/t/classes');
    
    // The code below won't execute due to the redirect
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <TeacherNotesClient classId={params?.classId || ''} />
        </Suspense>
    );
} 