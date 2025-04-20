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
import { Download, Search, Upload, SlidersHorizontal } from 'lucide-react';

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
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {studentName}</h1>
                    <p className="text-gray-500">{batchName} - Section {sectionName}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Button variant="outline" className="flex items-center gap-2">
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
                        <SelectTrigger className="w-[180px]">
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

            <div>
                <h2 className="text-xl font-semibold mb-2">Admin's Notes</h2>
                <div className="mb-4">
                    <Label htmlFor="subject-select">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger id="subject-select">
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
                        <Card key={subject} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                                <CardTitle>{subject}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    {notes.filter(note => note.subjectName === subject)[0]?.teacher?.user?.name || 'Teacher'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedSubject && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{selectedSubject}</h2>

                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Button type="submit" variant="ghost" size="icon">
                                    <Search size={20} />
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

                            <Button variant="ghost" size="icon">
                                <SlidersHorizontal size={20} />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="notes">
                        <TabsList>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="video">Video</TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">Topic</TableHead>
                                            <TableHead className="w-[30%]">Date Uploaded</TableHead>
                                            <TableHead className="w-[30%] text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8">
                                                    Loading notes...
                                                </TableCell>
                                            </TableRow>
                                        ) : notes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8">
                                                    No notes found for this subject.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            notes
                                                .filter(note => selectedSubject === 'all' || !selectedSubject || note.subjectName === selectedSubject)
                                                .map((note) => (
                                                    <TableRow key={note.id}>
                                                        <TableCell>{note.title}</TableCell>
                                                        <TableCell>{formatDate(note.createdAt)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {note.attachments.length > 0 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDownload(
                                                                        note.attachments[0].fileUrl,
                                                                        note.attachments[0].fileName
                                                                    )}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <Download size={18} className="mr-1" />
                                                                    Download
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
                            <div className="rounded-md border p-6 text-center">
                                <p className="text-gray-500">Video content will be displayed here</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mt-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default NotesLibrary; 