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
import { ChevronLeft, Search, Upload, Trash2, Download, Edit, Eye, FilePlus } from 'lucide-react';
import Link from 'next/link';
import NoteCard from './NoteCard';
import NotesViewer from './NotesViewer/index';
import { getLocalVideoData, storeVideoDataLocally, hasLocalVideoData } from './NotesViewer/utils';
import { toast } from 'react-hot-toast';

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Setup form
    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteFormSchema) as any,
        defaultValues: {
            title: '',
            content: '',
            subjectName: '',
            isPublished: false,
        },
    });

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, []);

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
        });
        setEditDialogOpen(true);
    };

    // Function to upload files to S3
    const uploadFileToS3 = async (file: File) => {
        try {
            setUploadProgress(0);
            const formData = new FormData();
            formData.append('pdf', file);

            // Create a custom XMLHttpRequest to track upload progress
            return new Promise<string>((resolve, reject) => {
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
                            resolve(response.url);
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
        }
    };

    // Function to process video data for a note
    const processVideoData = async (noteId: string, pdfUrl: string) => {
        try {
            setProcessingVideoData(true);

            // Call the API to start processing the PDF in the background
            const response = await fetch(`/api/notes/${noteId}/process-video-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pdfUrl }),
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

                    if (checkResponse.ok) {
                        // Video data exists, fetch it
                        const dataResponse = await fetch(`/api/notes/${noteId}/video-data`);
                        if (dataResponse.ok) {
                            const videoData = await dataResponse.json();

                            // Store in localStorage
                            storeVideoDataLocally(noteId, videoData);

                            toast.success('Video data processing completed successfully!');
                            setProcessingVideoData(false);

                            // Refresh notes to update UI
                            fetchNotes();
                            return;
                        }
                    }

                    // If we get here, data isn't ready yet
                    attempts++;
                    setTimeout(checkForVideoData, 10000); // Check again in 10 seconds
                } catch (error) {
                    console.error('Error checking for video data:', error);
                    attempts++;
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
                let pdfUrl = '';

                if (fileToUpload) {
                    // Upload the file to S3 first
                    pdfUrl = await uploadFileToS3(fileToUpload);

                    // Create note with attachment
                    noteData.fileType = 'pdf';

                    const attachmentData = {
                        fileUrl: pdfUrl,
                        fileName: fileToUpload.name,
                        fileType: fileToUpload.type,
                        fileSize: fileToUpload.size,
                        uploadedById: teacherId,
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
                    processVideoData(newNote.id, pdfUrl);
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
                    <Button variant="ghost" size="icon">
                        <ChevronLeft size={18} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{className}</h1>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Notes & Materials</h2>

                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="flex items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for any topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-md flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setUploadDialogOpen(true)}>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
                        <Upload size={20} />
                    </div>
                    <p className="font-medium">Upload Notes</p>
                </div>

                <div className="border p-4 rounded-md flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12h14"></path><path d="M7 5h14"></path><path d="M7 19h14"></path><path d="M3 5a1 1 0 1 0 0 1 1 1 0 0 0 0-1"></path><path d="M3 19a1 1 0 1 0 0 1 1 1 0 0 0 0-1"></path><rect x="1" y="10" width="4" height="4" rx="1"></rect></svg>
                    </div>
                    <p className="font-medium">Submit Numericals</p>
                </div>
            </div>

            <div className="flex items-center gap-4 my-4">
                <Button variant="outline" className="bg-purple-700 text-white hover:bg-purple-800">
                    Convert
                </Button>

                <Button variant="outline" className="border border-black flex items-center gap-2">
                    <span>Submit Notes</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </Button>
            </div>

            <h3 className="text-lg font-medium mb-2">Recent Notes and Video Explanations</h3>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">Title</TableHead>
                            <TableHead className="w-[20%]">Subject</TableHead>
                            <TableHead className="w-[15%]">Type</TableHead>
                            <TableHead className="w-[15%]">Date Uploaded</TableHead>
                            <TableHead className="w-[20%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading notes...
                                </TableCell>
                            </TableRow>
                        ) : notes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No notes found. Upload your first note.
                                </TableCell>
                            </TableRow>
                        ) : (
                            notes.map((note) => (
                                <TableRow key={note.id}>
                                    <TableCell>{note.title}</TableCell>
                                    <TableCell>{note.subjectName || 'N/A'}</TableCell>
                                    <TableCell>{note.fileType === 'video' ? 'Video' : 'Notes'}</TableCell>
                                    <TableCell>{formatDate(note.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditNote(note)}
                                                className="h-8 w-8"
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
                                                    className="h-8 w-8"
                                                >
                                                    <Download size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
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

            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mt-4">
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
                                <Button type="submit" disabled={uploadingFile}>
                                    {uploadingFile ? 'Uploading...' : 'Upload Note'}
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

            {/* Notes Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {
                    notes
                        .filter(note => activeTab === 'all' || (activeTab === 'published' ? note.isPublished : !note.isPublished))
                        .map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                subjectName={note.subjectName}
                                createdAt={note.createdAt}
                                attachments={note.attachments}
                                viewMode="teacher"
                                onViewVideo={handleViewVideo}
                            />
                        ))
                }
            </div>

            {/* Video Player Modal */}
            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0">
                    {selectedNoteId && (
                        <div className="h-full w-full">
                            <NotesViewer
                                noteId={selectedNoteId}
                                initialVideoData={selectedNoteId ? getLocalVideoData(selectedNoteId) : undefined}
                                pdfUrl={notes.find(n => n.id === selectedNoteId)?.attachments[0]?.fileUrl}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotesManagement; 