'use client';

import React, { useState, useEffect } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Download, 
    Search, 
    Upload, 
    SlidersHorizontal, 
    Video, 
    Eye, 
    Book, 
    GraduationCap 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import NotesViewer from './NotesViewer/index';
import { getLocalVideoData, hasLocalVideoData, storeVideoDataLocally } from './NotesViewer/utils';

interface NotesLibraryProps {
    studentId: string;
    studentName: string;
    classSectionId: string;
    batchName: string;
    sectionName: string;
}

type Note = {
    id: string;
    title: string;
    subjectName?: string;
    createdAt: string;
    fileType?: string;
    attachments: {
        id: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
    }[];
    teacher: {
        user: {
            name: string;
        };
    };
};

const NotesLibrary: React.FC<NotesLibraryProps> = ({
    studentId,
    studentName,
    classSectionId,
    batchName,
    sectionName,
}) => {
    // State variables
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, [classSectionId, selectedSubject]);

    // Function to fetch notes
    const fetchNotes = async () => {
        setLoading(true);
        try {
            let endpoint = `/api/class-sections/${classSectionId}/notes`;

            if (selectedSubject && selectedSubject !== 'all') {
                endpoint = `/api/class-sections/${classSectionId}/subjects/${encodeURIComponent(selectedSubject)}/notes`;
            }

            if (searchQuery) {
                endpoint = `/api/notes?query=${encodeURIComponent(searchQuery)}&classSectionId=${classSectionId}`;
                if (selectedSubject && selectedSubject !== 'all') {
                    endpoint += `&subjectName=${encodeURIComponent(selectedSubject)}`;
                }
            }

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const data = await response.json();
            setNotes(data);

            // Check if any notes have video data already in localStorage
            data.forEach((note: Note) => {
                if (hasLocalVideoData(note.id)) {
                    // Update the UI state to show these notes have video data available
                    console.log(`Note ${note.id} has video data in localStorage`);
                } else {
                    // Check with the server if video data exists
                    checkNoteVideoData(note.id);
                }
            });

            // Extract unique subjects from notes
            if (data.length > 0 && !selectedSubject) {
                const uniqueSubjects = Array.from(
                    new Set(
                        data
                            .filter((note: Note) => note.subjectName)
                            .map((note: Note) => note.subjectName)
                    )
                );
                setSubjects(uniqueSubjects as string[]);
            }
        } catch (err) {
            setError('Error fetching notes. Please try again later.');
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add a function to check if a note has video data on the server
    const checkNoteVideoData = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}/video-data`, {
                method: 'HEAD',
            });

            if (response.ok) {
                // Fetch the video data and store it locally
                const dataResponse = await fetch(`/api/notes/${noteId}/video-data`);
                if (dataResponse.ok) {
                    const videoData = await dataResponse.json();

                    if (videoData) {
                        // Store the video data in localStorage
                        storeVideoDataLocally(noteId, videoData);

                        // Refresh notes to update UI
                        console.log(`Note ${noteId} video data stored in localStorage`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error checking video data for note ${noteId}:`, error);
        }
    };

    // Function to handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!fileToUpload) return;

        setUploadingFile(true);

        try {
            // In a real implementation, you would:
            // 1. Upload the file to your storage (S3, etc.)
            // 2. Get the file URL
            // 3. Create a note with the file URL

            // Simulate file upload
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('File upload functionality would be implemented here');
            setFileToUpload(null);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Error uploading file. Please try again later.');
        } finally {
            setUploadingFile(false);
        }
    };

    // Function to handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNotes();
    };

    // Function to handle download
    const handleDownload = (fileUrl: string, fileName: string) => {
        // Create a link element
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
    };

    // Helper function to get ordinal suffix
    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const handleViewVideo = (noteId: string) => {
        setSelectedNoteId(noteId);
        setShowVideoModal(true);
    };

    const filteredNotes = notes.filter(note => {
        // First filter by subject tab
        if (activeTab !== 'all' && note.subjectName !== activeTab) {
            return false;
        }

        // Then filter by search query
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            (note.subjectName?.toLowerCase().includes(query) || false) ||
            note.teacher.user.name.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{studentName}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <GraduationCap size={16} />
                        {batchName} - Section {sectionName}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Button variant="outline" className="flex items-center gap-2 bg-white">
                            <Upload size={16} />
                            Upload Notes
                        </Button>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                        />
                    </div>

                    <Select>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Choose Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="default" className="bg-purple-700 hover:bg-purple-800">
                        Convert
                    </Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Book size={20} className="text-indigo-600" />
                    Admin&apos;s Notes
                </h2>
                <div className="mb-4">
                    <Label htmlFor="subject-select" className="text-sm font-medium">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger id="subject-select" className="mt-1">
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                    {subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subjects.slice(0, 3).map((subject) => (
                        <Card key={subject} className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-indigo-700">{subject}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                    {notes.filter(note => note.subjectName === subject)[0]?.teacher?.user?.name || 'Teacher'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedSubject && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {selectedSubject !== 'all' && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-input bg-background mr-2">
                                    {selectedSubject}
                                </span>
                            )}
                            {selectedSubject === 'all' ? 'All Notes' : 'Subject Materials'}
                        </h2>

                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search notes"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-[220px]"
                                    />
                                </div>
                                <Button type="submit" variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <Search size={18} />
                                </Button>
                            </form>

                            <Select>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="a-z">A-Z</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <SlidersHorizontal size={18} />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="notes" className="mt-4">
                        <TabsList>
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <Book size={14} />
                                Notes
                            </TabsTrigger>
                            <TabsTrigger value="video" className="flex items-center gap-1">
                                <Video size={14} />
                                Video
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes" className="mt-4">
                            <div className="rounded-lg border overflow-hidden bg-white">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-[40%] py-3">Topic</TableHead>
                                            <TableHead className="w-[20%] py-3">Subject</TableHead>
                                            <TableHead className="w-[20%] py-3">Date Uploaded</TableHead>
                                            <TableHead className="w-[20%] text-right py-3">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <div className="flex justify-center">
                                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900 mb-2"></div>
                                                    </div>
                                                    <p className="text-sm text-gray-500">Loading notes...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : notes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <p className="text-gray-500">No notes found for this subject.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            notes
                                                .filter(note => selectedSubject === 'all' || !selectedSubject || note.subjectName === selectedSubject)
                                                .map((note) => (
                                                    <TableRow key={note.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">{note.title}</TableCell>
                                                        <TableCell>{note.subjectName || '-'}</TableCell>
                                                        <TableCell>{formatDate(note.createdAt)}</TableCell>
                                                        <TableCell className="text-right space-x-1">
                                                            {hasLocalVideoData(note.id) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedNoteId(note.id);
                                                                        setShowVideoModal(true);
                                                                    }}
                                                                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                                                    title="Watch as video"
                                                                >
                                                                    <Video size={18} />
                                                                </Button>
                                                            )}
                                                            
                                                            {note.attachments.length > 0 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDownload(
                                                                        note.attachments[0].fileUrl,
                                                                        note.attachments[0].fileName
                                                                    )}
                                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                                    title="Download"
                                                                >
                                                                    <Download size={18} />
                                                                </Button>
                                                            )}
                                                            
                                                            {note.attachments.length > 0 && note.attachments[0].fileType.includes('pdf') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                                    onClick={() => window.open(note.attachments[0].fileUrl, '_blank')}
                                                                    title="View PDF"
                                                                >
                                                                    <Eye size={18} />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="video">
                            <div className="rounded-md border p-6 text-center bg-gray-50">
                                <Video size={40} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">Video content will be displayed here</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-md mt-4 border border-red-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Video Player Modal */}
            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0">
                    <DialogHeader className="absolute top-0 right-0 z-10 p-2">
                        <DialogTitle className="sr-only">Notes Viewer</DialogTitle>
                        <DialogDescription className="sr-only">
                            Interactive PDF notes viewer
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNoteId && (
                        <div className="h-full w-full">
                            <NotesViewer
                                noteId={selectedNoteId}
                                initialVideoData={selectedNoteId ? getLocalVideoData(selectedNoteId) : undefined}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotesLibrary; 