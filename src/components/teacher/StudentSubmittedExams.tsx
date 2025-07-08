"use client";
import React from "react";
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";

// Interface for a single question
interface Question {
  id: string;
  examId: string;
  questionText: string;
  questionType?: 'MCQ' | 'LONG_ANSWER';
  marks: number;
  options?: string[];
  correctAnswer?: string[];
  difficultyLevel?: string;
}

// Interface for the class section details
interface ClassSection {
  id: string;
  batch: {
    name: string;
  };
  semester: {
    name: string;
  };
}

interface Question2 {
  questions: Array<{
    id: string;
    examId: string;
    questionText: string;
    questionType?: string; // This will now correctly reflect 'MCQ' or 'LONG_ANSWER'
    marks: number;
    options?: string[];
    correctAnswer?: string[];
    difficultyLevel?: string;
  }>;
}

// The primary interface for dynamic exam data
interface Exam {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  examSubmissions: Array<{
    id: string;
    examId: string;
    studentId: string;
    submissionTime: Date | string;
    obtainedMarks: number;
    status: string;
    gradedById?: string | null;
    gradedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    student: {
      id: string;
      user: {
        name: string;
        email: string;
      }
      currentSemester: string;
      currentYear: string;
      studentRoll: string;
      department: {
        id: string;
        name: string;
      }
    }
  }>
  classSection: {
    batch: {
      name: string;
    };
    semester: {
      name: string;
    };
  };
  examType?: {
    name: string;
  };
}

export function StudentSubmittedExams({exam}: { exam: Exam; }) {
  console.log("ExamSubmissionsPage ", exam)
  // Flatten all submissions from all exams into a single array
  // Each submission object is enhanced with the totalMarks from its parent exam
  const allSubmissions = (exam.examSubmissions || []).map(submission => ({
      ...submission,
      examTotalMarks: exam.totalMarks,
    })).flat();

  //id: allSubmissions[0].id
  //studentId: allSubmissions[0].student.id
  console.log("allSubmissions ", allSubmissions)

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Exam Submissions</h1>
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
            {allSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              allSubmissions.map((submission) => (
                <TableRow key={submission.id} className="border-b hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium">{submission.student.user.name}</TableCell>
                  <TableCell>{submission.student.studentRoll}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="hover:bg-blue-50">
                      View Paper
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                              {submission.obtainedMarks ? submission.obtainedMarks : "-" }/{submission.examTotalMarks || 100}

                          </span>
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
    </div>
  );
}