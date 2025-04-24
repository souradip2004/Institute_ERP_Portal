'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Search, Upload, Trash2, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import NotesViewer from './NotesViewer/index';
import { getLocalVideoData, storeVideoDataLocally } from './NotesViewer/utils';
import { toast } from 'react-hot-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import VideoPlayerModal from './NotesViewer/modal';
import { redirect } from 'next/navigation';

interface NotesManagementProps {
    teacherId: string;
    teacherName: string;
    classSectionId: string;
    className: string;
    batchName: string;
    sectionName: string;
}

type Note = {
    id: string;
    title: string;
    content?: string;
    subjectName?: string;
    fileType?: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    classSectionId: string;
    gender?: string;
    attachments: {
        id: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }[];
};

// Form validation schema
const noteFormSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    subjectName: z.string().min(1, 'Subject name is required'),
    isPublished: z.boolean().default(false),
    gender: z.enum(['Male', 'Female']).default('Male'),
});

// Use the schema to infer the form values type
type NoteFormValues = z.infer<typeof noteFormSchema>;

const NotesManagement: React.FC<NotesManagementProps> = ({
    teacherId,
    teacherName,
    classSectionId,
    className,
    batchName,
    sectionName
}) => {
    // State variables
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [showAddNoteForm, setShowAddNoteForm] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<string>('published');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
    const [processingVideoData, setProcessingVideoData] = useState<boolean>(false);
    const [teacherUserId, setTeacherUserId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const classId = user?.classSectionId as string;

    // Setup form
    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteFormSchema) as any,
        defaultValues: {
            title: '',
            content: '',
            subjectName: '',
            isPublished: false,
            gender: 'Male',
        },
    });

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
        // Fetch teacher data to get the user ID
        const fetchTeacherData = async () => {
            try {
                const response = await fetch(`/api/teachers/${teacherId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch teacher data');
                }
                const data = await response.json();
                if (data && data.user && data.user.id) {
                    setTeacherUserId(data.user.id);
                } else {
                    setError('Could not retrieve teacher user ID');
                }
            } catch (err) {
                console.error('Error fetching teacher data:', err);
                setError('Error fetching teacher data');
            }
        };

        fetchTeacherData();
    }, [teacherId]);

    // Function to fetch notes
    const fetchNotes = async () => {
        setLoading(true);
        try {
            let endpoint = `/api/teachers/${teacherId}/notes`;

            if (searchQuery) {
                endpoint = `/api/notes?query=${encodeURIComponent(searchQuery)}&classSectionId=${classSectionId}`;
            }

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const data = await response.json();
            // Filter notes for this class section
            const filteredNotes = data.filter((note: Note) => note.classSectionId === classSectionId);
            setNotes(filteredNotes);
        } catch (err) {
            setError('Error fetching notes. Please try again later.');
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileToUpload(e.target.files[0]);
            setSelectedFile(e.target.files[0]);
        }
    };

    // Function to handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNotes();
    };

    // Function to open edit dialog
    const handleEditNote = (note: Note) => {
        setCurrentNote(note);
        form.reset({
            title: note.title,
            content: note.content || '',
            subjectName: note.subjectName || '',
            isPublished: note.isPublished,
            gender: (note.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
        });
        setEditDialogOpen(true);
    };

    // Function to upload files to S3
    const uploadFileToS3 = async (file: File) => {
        try {
            setUploadProgress(0);
            setUploadingFile(true);
            const formData = new FormData();
            formData.append('pdf', file);

            // Create a custom XMLHttpRequest to track upload progress
            return new Promise<{
                url: string;
                fileName: string;
                fileType: string;
                fileSize: number;
            }>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percentComplete);
                    }
                });

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                resolve({
                                    url: response.url,
                                    fileName: response.fileName,
                                    fileType: response.fileType,
                                    fileSize: response.fileSize
                                });
                            } else {
                                reject(new Error(response.message || 'Upload failed'));
                            }
                        } else {
                            reject(new Error(`Upload failed with status: ${xhr.status}`));
                        }
                    }
                };

                xhr.open('POST', '/api/upload/pdf', true);
                xhr.send(formData);
            });
        } catch (error) {
            console.error("Error uploading file to S3:", error);
            throw error;
        } finally {
            setUploadingFile(false);
        }
    };

    // Function to process video data for a note
    const processVideoData = async (noteId: string, pdfUrl: string, gender: string = 'Male') => {
        try {
            setProcessingVideoData(true);

            // Call the API to start processing the PDF in the background
            const response = await fetch(`/api/notes/${noteId}/process-video-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pdfUrl, gender }),
            });

            if (!response.ok) {
                throw new Error('Failed to start video data processing');
            }

            // Show toast that processing has started
            toast.success('PDF processing started in the background. This may take a few minutes.');

            // Poll for video data every 10 seconds
            let attempts = 0;
            const maxAttempts = 30; // Try for up to 5 minutes

            const checkForVideoData = async () => {
                if (attempts >= maxAttempts) {
                    toast.error('Video data processing is taking longer than expected. Please check back later.');
                    setProcessingVideoData(false);
                    return;
                }

                try {
                    // Check if video data exists
                    const checkResponse = await fetch(`/api/notes/${noteId}/video-data`, {
                        method: 'HEAD',
                    });

                    // Check response headers for video data existence
                    const hasVideoData = checkResponse.headers.get('x-has-video-data') === 'true';

                    if (checkResponse.ok && hasVideoData) {
                        // Video data exists, fetch it
                        const dataResponse = await fetch(`/api/notes/${noteId}/video-data`);
                        if (dataResponse.ok) {
                            const videoData = await dataResponse.json();

                            // Validate video data before storing
                            if (!videoData || (Array.isArray(videoData) && videoData.length === 0)) {
                                console.error(`Received empty video data for note ${noteId}`);
                                attempts++;
                                setTimeout(checkForVideoData, 10000);
                                return;
                            }

                            console.log(`Received video data for note ${noteId}:`,
                                JSON.stringify(videoData).substring(0, 200) + '...');

                            // Store in localStorage
                            storeVideoDataLocally(noteId, videoData);

                            toast.success('Video data processing completed successfully!');
                            setProcessingVideoData(false);

                            // Refresh notes to update UI
                            fetchNotes();
                            return;
                        }
                    } else if (checkResponse.status === 404) {
                        // Data is still being processed, this is expected
                        console.log(`Video data not yet available for note ${noteId}, attempt ${attempts + 1}/${maxAttempts}`);
                        attempts++;
                        setTimeout(checkForVideoData, 10000); // Check again in 10 seconds
                        return;
                    } else {
                        // Unexpected status code
                        console.error(`Unexpected status code ${checkResponse.status} checking for video data`);
                        attempts++;
                        setTimeout(checkForVideoData, 10000);
                        return;
                    }
                } catch (error) {
                    console.error('Error checking for video data:', error);
                    attempts++;

                    // Don't continue retrying on network errors if server is unreachable
                    if (attempts >= 3 && error instanceof TypeError && error.message.includes('Failed to fetch')) {
                        toast.error('Unable to connect to server. Please check your connection and try again later.');
                        setProcessingVideoData(false);
                        return;
                    }

                    setTimeout(checkForVideoData, 10000); // Try again despite error
                }
            };

            // Start polling
            setTimeout(checkForVideoData, 10000);

        } catch (error) {
            console.error('Error processing video data:', error);
            toast.error('Failed to process video data');
            setProcessingVideoData(false);
        }
    };

    // Function to handle form submission
    const onSubmit = async (values: NoteFormValues) => {
        try {
            if (currentNote) {
                // Update existing note
                const response = await fetch(`/api/notes/${currentNote.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (!response.ok) {
                    throw new Error('Failed to update note');
                }

                toast.success('Note updated successfully');
                setEditDialogOpen(false);
                fetchNotes();
            } else {
                // Create new note
                const noteData: any = {
                    ...values,
                    teacherId,
                    classSectionId,
                };

                let response;
                let fileUploadResult;
                let pdfUrl = '';

                if (fileToUpload) {
                    try {
                        // Check if teacherUserId is available when uploading an attachment
                        if (!teacherUserId) {
                            toast.error('Teacher user information not available. Please try again in a moment.');
                            return;
                        }

                        // Upload the file to S3 first
                        fileUploadResult = await uploadFileToS3(fileToUpload);
                        pdfUrl = fileUploadResult.url;

                        // Create note with attachment
                        noteData.fileType = 'pdf';

                        const attachmentData = {
                            fileUrl: fileUploadResult.url,
                            fileName: fileUploadResult.fileName,
                            fileType: fileUploadResult.fileType,
                            fileSize: fileUploadResult.fileSize,
                            uploadedById: teacherUserId || '', // Use the user ID associated with the teacher
                        };

                        response = await fetch('/api/notes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...noteData,
                                attachments: [attachmentData],
                            }),
                        });
                    } catch (error) {
                        console.error('Error uploading file:', error);
                        toast.error('Error uploading file. Please try again.');
                        return;
                    }
                } else {
                    // Create note without attachment
                    response = await fetch('/api/notes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(noteData),
                    });
                }

                if (!response.ok) {
                    throw new Error('Failed to create note');
                }

                // Get the created note ID
                const newNote = await response.json();

                toast.success('Note created successfully');
                setShowAddNoteForm(false);
                setFileToUpload(null);
                setSelectedFile(null);
                form.reset();

                // If we have a PDF file, process it for video data
                if (pdfUrl && newNote.id) {
                    processVideoData(newNote.id, pdfUrl, values.gender);
                }

                fetchNotes();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to save note');
        }
    };

    // Function to delete a note
    const handleDeleteNote = async (id: string) => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                const response = await fetch(`/api/notes/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete note');
                }

                fetchNotes();
            } catch (err) {
                console.error('Error deleting note:', err);
                setError('Error deleting note. Please try again later.');
            }
        }
    };

    // Function to download attachment
    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredNotes = notes.filter(note => {
        if (activeTab === 'published') return note.isPublished;
        if (activeTab === 'drafts') return !note.isPublished;

        // If tab is 'all', return all notes that belong to this class section
        return note.classSectionId === classSectionId;
    });

    const handleViewVideo = (noteId: string) => {
        setSelectedNoteId(noteId);
        setShowVideoModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Link href={{ pathname: `/dashboard/teacher/class/${classSectionId}` }}>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <ChevronLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{className}</h1>
                    <p className="text-sm text-gray-500">Teacher: {teacherName} • Batch: {batchName} • Section: {sectionName}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Notes & Materials</h2>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="flex items-center">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center h-48"
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                            <Upload size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-1">Upload Notes</h3>
                        <p className="text-white/80 text-sm text-center">Add new PDF notes for students</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center h-48">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12h14"></path><path d="M7 5h14"></path><path d="M7 19h14"></path><path d="M3 5a1 1 0 1 0 0 1 1 1 0 0 0 0-1"></path><path d="M3 19a1 1 0 1 0 0 1 1 1 0 0 0 0-1"></path><rect x="1" y="10" width="4" height="4" rx="1"></rect></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-1">Submit Numericals</h3>
                        <p className="text-white/80 text-sm text-center">Create practice problems for students</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center h-48"
                        onClick={() => redirect(`/t/classes/${classId}/assignments`)}>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v6h6"></path><path d="M2 15h10"></path><path d="m9 18 3-3-3-3"></path></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-1">Create Assignment</h3>
                        <p className="text-white/80 text-sm text-center">Assign homework and track progress</p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Notes
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'published' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('published')}
                        >
                            Published
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'drafts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('drafts')}
                        >
                            Drafts
                        </button>
                    </div>
                </div>

                <div className="rounded-md border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[30%] py-3 font-semibold">Title</TableHead>
                                <TableHead className="w-[20%] py-3 font-semibold">Subject</TableHead>
                                <TableHead className="w-[15%] py-3 font-semibold">Type</TableHead>
                                <TableHead className="w-[15%] py-3 font-semibold">Date Uploaded</TableHead>
                                <TableHead className="w-[20%] text-right py-3 font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin mb-2"></div>
                                            <p className="text-gray-500">Loading notes...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : notes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            </div>
                                            <p className="text-gray-500 mb-1">No notes found</p>
                                            <p className="text-gray-400 text-sm">Upload your first note to get started</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notes
                                    .filter(note => activeTab === 'all' || (activeTab === 'published' ? note.isPublished : !note.isPublished))
                                    .map((note) => (
                                        <TableRow key={note.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                {note.title}
                                                {note.isPublished && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Published</span>
                                                )}
                                                {!note.isPublished && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{note.subjectName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    {note.fileType === 'video' ? (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                                                            <span>Video</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                            <span>PDF</span>
                                                        </>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(note.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewVideo(note.id)}
                                                        className="h-8 w-8 rounded-full hover:bg-indigo-50 hover:text-indigo-700"
                                                        title="View interactive notes"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M12 19c-4 0-7.5-3-9-6 1.5-3 5-6 9-6s7.5 3 9 6c-1.5 3-5 6-9 6Z" /></svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditNote(note)}
                                                        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-700"
                                                        title="Edit note"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    {note.attachments.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDownload(
                                                                note.attachments[0].fileUrl,
                                                                note.attachments[0].fileName
                                                            )}
                                                            className="h-8 w-8 rounded-full hover:bg-green-50 hover:text-green-700"
                                                            title="Download"
                                                        >
                                                            <Download size={16} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-md mt-4 flex items-center shadow-sm">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Upload Note Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload New Note</DialogTitle>
                        <DialogDescription>
                            Upload notes or materials for your students.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Note title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subjectName"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Subject name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Content (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Note content or description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                            Publish immediately
                                        </FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Voice Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="file">Attachment (Optional)</Label>
                                <div className="border-2 border-dashed rounded-md p-4">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Upload size={24} className="text-gray-400" />
                                        <p className="text-sm text-gray-500">
                                            {fileToUpload ? fileToUpload.name : 'Drag and drop or click to upload'}
                                        </p>
                                        <input
                                            id="file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('file')?.click()}
                                        >
                                            Select File
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setUploadDialogOpen(false);
                                        form.reset();
                                        setFileToUpload(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploadingFile || (!!fileToUpload && teacherUserId === null)}
                                >
                                    {uploadingFile ? 'Uploading...' : fileToUpload && !teacherUserId ? 'Loading user data...' : 'Upload Note'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Note Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Update note details.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Note title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subjectName"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Subject name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Content (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Note content or description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                            Published
                                        </FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Voice Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditDialogOpen(false);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Video Player Modal */}
            <VideoPlayerModal
                isOpen={showVideoModal}
                onClose={() => setShowVideoModal(false)}
            >
                {selectedNoteId && (
                    <NotesViewer
                        noteId={selectedNoteId}
                        initialVideoData={selectedNoteId ? getLocalVideoData(selectedNoteId) : undefined}
                        pdfUrl={notes.find(n => n.id === selectedNoteId)?.attachments[0]?.fileUrl}
                    />
                )}
            </VideoPlayerModal>

            {/* Processing Modal */}
            {processingVideoData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Processing PDF</h3>
                        <p className="mb-6 text-gray-600">Converting your PDF into an interactive learning experience. This may take a few minutes.</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <div className="text-right text-sm text-gray-500">{Math.round(uploadProgress)}% complete</div>
                    </div>
                </div>
            )}

            {/* Show selected file name if it exists */}
            {selectedFile && (
                <div className="mt-2 text-sm text-gray-500">
                    Selected file: {selectedFile.name}
                </div>
            )}
        </div>
    );
};

export default NotesManagement; 