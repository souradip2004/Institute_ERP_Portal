'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Video, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { hasLocalVideoData } from './NotesViewer/utils';

interface NoteCardProps {
    id: string;
    title: string;
    subjectName?: string;
    createdAt: string;
    teacherName?: string;
    attachments: {
        fileUrl: string;
        fileName: string;
        fileType: string;
    }[];
    viewMode?: 'teacher' | 'student';
    onViewVideo?: (noteId: string) => void;
}

export default function NoteCard({
    id,
    title,
    subjectName,
    createdAt,
    teacherName,
    attachments,
    viewMode = 'student',
    onViewVideo
}: NoteCardProps) {
    const [hasVideoData, setHasVideoData] = useState<boolean>(false);
    const pdfAttachment = attachments.find(att => att.fileType.includes('pdf'));

    useEffect(() => {
        // Check if we have video data in localStorage
        setHasVideoData(hasLocalVideoData(id));

        // Also check the server
        const checkVideoData = async () => {
            try {
                const response = await fetch(`/api/notes/${id}/video-data`, {
                    method: 'HEAD',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.hasVideoData) {
                        setHasVideoData(true);
                    }
                }
            } catch (error) {
                console.error("Error checking for video data:", error);
            }
        };

        checkVideoData();
    }, [id]);

    const handleViewVideo = () => {
        if (onViewVideo) {
            onViewVideo(id);
        }
    };

    return (
        <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {subjectName && (
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{subjectName}</span>
                        </div>
                    )}

                    {teacherName && (
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span>{teacherName}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 flex-col items-stretch gap-2">
                {pdfAttachment && (
                    <Link href={{ pathname: pdfAttachment.fileUrl }} target="_blank" className="w-full">
                        <Button variant="outline" className="w-full flex gap-2 items-center">
                            <Eye className="h-4 w-4" />
                            <span>View PDF</span>
                        </Button>
                    </Link>
                )}

                {hasVideoData && (
                    <Button
                        onClick={handleViewVideo}
                        className="w-full flex gap-2 items-center"
                    >
                        <Video className="h-4 w-4" />
                        <span>View as Video</span>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
} 