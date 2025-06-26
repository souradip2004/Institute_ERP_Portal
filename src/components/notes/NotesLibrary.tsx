'use client';

import React, {useState, useEffect} from 'react';
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
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Download,
    Search,
    Upload,
    SlidersHorizontal,
    Video,
    Eye,
    Film,
    Book,
    GraduationCap
} from 'lucide-react';
import VideoPlayerModal from '@/components/notes/NotesViewer/modal';
import NotesViewer from './NotesViewer/index';
import {getLocalVideoData, hasLocalVideoData, storeVideoDataLocally} from './NotesViewer/utils';

interface NotesLibraryProps {
    studentId: string;
    studentName: string;
    classSectionId: string;
    batchName: string;
    sectionName: string;
    openNoteInModal?: (noteProps: { pdfUrl?: string; noteId?: string; initialVideoData?: any }) => void;
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
    openNoteInModal,
}) => {
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

    useEffect(() => {
        fetchNotes();
    }, [classSectionId, selectedSubject]);

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
            if (!response.ok) throw new Error('Failed to fetch notes');

            const data = await response.json();
            setNotes(data);

            data.forEach((note: Note) => {
                if (hasLocalVideoData(note.id)) {
                    console.log(`Note ${note.id} has video data in localStorage`);
                } else {
                    checkNoteVideoData(note.id);
                }
            });

            if (data.length > 0 && !selectedSubject) {
                const uniqueSubjects = Array.from(
                    new Set(
                        data.filter((note: Note) => note.subjectName).map((note: Note) => note.subjectName)
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

    const checkNoteVideoData = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}/video-data`, {method: 'HEAD'});
            if (response.ok) {
                const dataResponse = await fetch(`/api/notes/${noteId}/video-data`);
                if (dataResponse.ok) {
                    const videoData = await dataResponse.json();
                    if (videoData) {
                        storeVideoDataLocally(noteId, videoData);
                        console.log(`Note ${noteId} video data stored in localStorage`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error checking video data for note ${noteId}:`, error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!fileToUpload) return;
        setUploadingFile(true);
        try {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNotes();
    };

    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${date.toLocaleString('default', {month: 'long'})}, ${date.getFullYear()}`;
    };

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    const handleViewVideo = (noteId: string) => {
        if (openNoteInModal) {
            openNoteInModal({
                noteId,
                initialVideoData: getLocalVideoData(noteId),
            });
        } else {
            setSelectedNoteId(noteId);
            setShowVideoModal(true);
        }
    };

    const filteredNotes = notes.filter(note => {
        if (activeTab !== 'all' && note.subjectName !== activeTab) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            (note.subjectName?.toLowerCase().includes(query) || false) ||
            note.teacher.user.name.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 ">
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{studentName}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <GraduationCap size={16}/>
                        {batchName} - Section {sectionName}
                    </p>
                </div>
               
            </div>

            {selectedSubject && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 sm:gap-2">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {selectedSubject !== 'all' && (
                                <span
                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-input bg-background mr-2">
                {selectedSubject}
              </span>
                            )}
                            {selectedSubject === 'all' ? 'All Notes' : 'Subject Materials'}
                        </h2>
                        <div
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto max-w-full"> {/* Added max-w-full to ensure container respects boundaries */}
                            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-grow">
                                    <Search size={16}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                    <Input
                                        placeholder="Search notes"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-full min-w-0" // Added min-w-0 to allow input to shrink
                                    />
                                </div>
                                <Button type="submit" variant="ghost" size="icon"
                                        className="hover:bg-gray-100 hidden sm:block">
                                    <Search size={18}/>
                                </Button>
                            </form>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[120px]">
                                    <SelectValue placeholder="Sort By"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="a-z">A-Z</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 w-full sm:w-auto">
                                <SlidersHorizontal size={18}/>
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="notes" className="mt-4">
                        <TabsList
                            className="flex flex-wrap gap-2"> {/* flex-wrap already present, good for mobile tabs */}
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <Book size={14}/>
                                Notes
                            </TabsTrigger>
                            <TabsTrigger value="video" className="flex items-center gap-1">
                                <Video size={14}/>
                                Videos
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes" className="mt-4">
                            {/* THIS IS THE CRITICAL PART FOR MOBILE OVERFLOW */}
                            <div
                                className="overflow-x-auto rounded-lg border bg-white max-w-full"> {/* Added max-w-full here */}
                                <Table className="w-full"> {/* Changed from min-w-[700px] to w-full */}
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            {/* Adjusted min-width values and removed whitespace-nowrap for better wrapping */}
                                            <TableHead className="py-3 w-1/4 min-w-[120px]">Topic</TableHead>
                                            <TableHead className="py-3 w-1/4 min-w-[100px]">Subject</TableHead>
                                            <TableHead className="py-3 w-1/4 min-w-[120px] whitespace-nowrap">Date
                                                Uploaded</TableHead> {/* Kept nowrap for dates */}
                                            <TableHead
                                                className="py-3 text-right w-1/4 min-w-[140px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4}
                                                           className="text-center py-8 px-2"> {/* Reduced padding */}
                                                    <div className="flex justify-center">
                                                        <div
                                                            className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900 mb-2"/>
                                                    </div>
                                                    <p className="text-sm text-gray-500">Loading notes...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : notes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4}
                                                           className="text-center py-8 px-2"> {/* Reduced padding */}
                                                    <p className="text-gray-500">No notes found for this subject.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            notes
                                            .filter(note => selectedSubject === 'all' || !selectedSubject || note.subjectName === selectedSubject)
                                            .map(note => (
                                                <TableRow key={note.id} className="hover:bg-gray-50">
                                                    {/* Added break-words and max-w- attribute to content cells */}
                                                    <TableCell
                                                        className="font-medium pr-2 break-words max-w-[120px]">{note.title}</TableCell>
                                                    <TableCell
                                                        className="pr-2 break-words max-w-[100px]">{note.subjectName || '-'}</TableCell>
                                                    <TableCell
                                                        className="pr-2 whitespace-nowrap">{formatDate(note.createdAt)}</TableCell>
                                                    {/* Actions cell: now uses flexbox with wrapping and smaller gap */}
                                                    <TableCell
                                                        className="text-right flex flex-wrap justify-end gap-1 px-2 py-2"> {/* Added flex-wrap, justify-end, gap-1, adjusted px/py */}
                                                        {hasLocalVideoData(note.id) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewVideo(note.id)}
                                                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex-shrink-0"
                                                                title="Watch as video"
                                                            >
                                                                <Video size={18}/>
                                                            </Button>
                                                        )}
                                                        {note.attachments.length > 0 && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleDownload(
                                                                            note.attachments[0].fileUrl,
                                                                            note.attachments[0].fileName
                                                                        )
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex-shrink-0"
                                                                    title="Download"
                                                                >
                                                                    <Download size={18}/>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={async () => {
                                                                        const randomCode = Math.floor(100000 + Math.random() * 900000);
                                                                        const response = await fetch("/api/connector", {
                                                                            method: "POST",
                                                                            headers: {"Content-Type": "application/json"},
                                                                            body: JSON.stringify({
                                                                                id: randomCode,
                                                                                link: note.attachments[0].fileUrl
                                                                            })
                                                                        });
                                                                        if (response.ok) {
                                                                            window.open(`http//localhost:3000/share?id=${randomCode}`, '_blank');
                                                                        }
                                                                    }}
                                                                    className="h-8 w-8 rounded-full hover:bg-yellow-50 hover:text-yellow-700 flex-shrink-0"
                                                                    title="Share video link"
                                                                >
                                                                    <Film size={16}/>
                                                                </Button>
                                                            </>
                                                        )}
                                                        {note.attachments.length > 0 &&
                                                            note.attachments[0].fileType.includes('pdf') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 flex-shrink-0"
                                                                    onClick={() =>
                                                                        window.open(note.attachments[0].fileUrl, '_blank')
                                                                    }
                                                                    title="View PDF"
                                                                >
                                                                    <Eye size={18}/>
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

                        <TabsContent value="video" className="mt-4">
                            <div className="rounded-md border p-6 text-center bg-gray-50">
                                <Video size={40} className="mx-auto text-gray-400 mb-2"/>
                                <p className="text-gray-500">Video content will be displayed here</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {error && (
                <div
                    className="bg-red-100 text-red-800 p-4 rounded-md mt-4 border border-red-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"/>
                    </svg>
                    {error}
                </div>
            )}

            {!openNoteInModal && (
                <VideoPlayerModal
                    isOpen={showVideoModal}
                    onClose={() => {
                        setShowVideoModal(false);
                        setSelectedNoteId(null);
                    }}
                >
                    {selectedNoteId && (
                        <div className="w-full h-full flex">
                            <NotesViewer
                                noteId={selectedNoteId}
                                initialVideoData={getLocalVideoData(selectedNoteId)}
                            />
                        </div>
                    )}
                </VideoPlayerModal>
            )}
        </div>
    );
};

export default NotesLibrary;