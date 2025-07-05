"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Student {
    id: string;
    studentRoll: string;
    user: { name: string };
}

interface Exam {
    id: string;
    classSectionId: string;
    totalMarks?: number;
}

interface ExamSubmission {
    id: string;
    student: Student;
    exam: Exam;
    obtainedMarks: number;
    submissionTime: string;
    status: string;
}

export default function ExamSubmissionsPage() {
    const params = useParams();
    const classId = params?.classId as string;
    const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/exam-submissions");
                if (!res.ok) throw new Error("Failed to fetch submissions");
                const data = await res.json();
                // Filter by classSectionId
                const filtered = data.filter((s: ExamSubmission) => s.exam.classSectionId === classId);
                setSubmissions(filtered);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        // if (classId) fetchSubmissions();
    }, [classId]);

    useEffect(() => {
        setSubmissions([
            {
                id: "1",
                student: { id: "1", studentRoll: "123456", user: { name: "John Doe" } },
                exam: { id: "1", classSectionId: "1", totalMarks: 100 },
                obtainedMarks: 85,
                submissionTime: "2024-01-01 10:00:00",
                status: "Submitted"
            },
            {
                id: "2",
                student: { id: "2", studentRoll: "789012", user: { name: "Jane Smith" } },
                exam: { id: "1", classSectionId: "1", totalMarks: 100 },
                obtainedMarks: 92,
                submissionTime: "2024-01-01 09:45:00",
                status: "Submitted"
            },
            {
                id: "3",
                student: { id: "3", studentRoll: "345678", user: { name: "Robert Johnson" } },
                exam: { id: "1", classSectionId: "1", totalMarks: 100 },
                obtainedMarks: 78,
                submissionTime: "2024-01-01 11:15:00",
                status: "Submitted"
            },
            {
                id: "4",
                student: { id: "4", studentRoll: "901234", user: { name: "Emily Davis" } },
                exam: { id: "1", classSectionId: "1", totalMarks: 100 },
                obtainedMarks: 95,
                submissionTime: "2024-01-01 08:30:00",
                status: "Submitted"
            },
        ]);
        setLoading(false);
    }, [])

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Exam Submissions</h1>
            {loading ? (
                <div className="text-center text-lg">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-gray-50">
                                <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                                <TableHead className="font-semibold text-gray-700">Class Roll</TableHead>
                                <TableHead className="font-semibold text-gray-700">View Paper</TableHead>
                                <TableHead className="font-semibold text-gray-700">Marks</TableHead>
                                <TableHead className="font-semibold text-gray-700">AI Copy Checking</TableHead>
                                <TableHead className="font-semibold text-gray-700">Submission Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No submissions found for this class.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission) => (
                                    <TableRow key={submission.id} className="border-b hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium">{submission.student.user?.name || "-"}</TableCell>
                                        <TableCell>{submission.student.studentRoll}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" className="hover:bg-blue-50">
                                                View Paper
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">
                                                    {submission.obtainedMarks}/{submission.exam.totalMarks || 100}
                                                </span>
                                                {/* <Button size="sm" variant="secondary" className="ml-2 bg-blue-50 hover:bg-blue-100 text-blue-600">
                                                    Edit
                                                </Button> */}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                AI Copy Check
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {new Date(submission.submissionTime).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
