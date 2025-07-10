"use client";
import React, {useState} from "react";
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import ViewPaper from '../../components/teacher/ViewPaper';
import axios from "axios";
import {Exam} from "@/types/exam";
import {Loader, Loader2} from "lucide-react";

export function StudentSubmittedExams({submittedExam, setSubmittedExam}: {
  submittedExam: Exam;
  setSubmittedExam: any
}) {
  console.log("ExamSubmissionsPage ", submittedExam)
  const allSubmissions = (submittedExam.examSubmissions || []).map(submission => ({
    ...submission,
    examTotalMarks: submittedExam.totalMarks,
  }));

  //id: allSubmissions[0].id
  //studentId: allSubmissions[0].student.id

  console.log("allSubmissions ", allSubmissions)

  const [viewPaperOpen, setViewPaperOpen] = useState(false);
  const [id, SetId] = useState('');
  const [studentId, SetStudentId] = useState('');
  const [aiCopyCheck, setAiCopyCheck] = useState({checking: false, submissionId: ""});

  const handleAiCopyCheck = async (id: string, studentId: string) => {
    try {
      const alreadyGraded = allSubmissions.find(submission => submission.id === id && submission.status === 'GRADED');

      if (alreadyGraded) {
        alert("This exam has already been graded");
        return;
      }

      setAiCopyCheck({checking: true, submissionId: id});
      const teacherId = (JSON.parse(localStorage.getItem('user') || '{}') as { teacherId?: string }).teacherId ?? null;

      const response = await axios.get(`/api/exam/answer-script/ai-copy-checking?id=${id}&studentId=${studentId}&teacherId=${teacherId}`);

      console.log("response ", response.data)

      setSubmittedExam((prev: Exam) => {
        return {
          ...prev,
          examSubmissions: prev.examSubmissions.map(submission => {
            if (submission.id === response.data.id) {

              return {
                ...submission,
                obtainedMarks: response.data.obtainedMarks,
                status: response.data.status
              }
            }

            return submission;
          })
        };
      });

      alert("AI Copy Check Successful");

    } catch (e) {
      alert("AI Copy Check Failed");
    } finally {
      setAiCopyCheck({checking: false, submissionId: ""});
    }
  }

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
                    <Button
                      size="sm" variant="outline" className="hover:bg-blue-50"
                      onClick={() => {
                        SetId(submission.id);
                        SetStudentId(submission.studentId);
                        setViewPaperOpen(true);
                      }}
                    >
                      View Paper
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {(submission.obtainedMarks) ? submission.obtainedMarks : submission.status === 'GRADED' ? Number((submission.obtainedMarks).toFixed(2)) : "-"}/{ Number((submission.examTotalMarks).toFixed(2))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={aiCopyCheck.checking && submission.id === aiCopyCheck.submissionId}
                      className={`bg-purple-600 hover:bg-purple-700 text-white
                      ${(aiCopyCheck.checking && submission.id === aiCopyCheck.submissionId) ? 'cursor-not-allowed opacity-70' : ''}
                      `}
                      onClick={() => handleAiCopyCheck(submission.id, submission.studentId)}
                    >
                      {(aiCopyCheck.checking && submission.id === aiCopyCheck.submissionId) ? (
                          <><Loader2 className="h-3 w-3 mr-2 animate-spin"/> AI Checking</>) :
                        "AI Copy Check"
                      }
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

      {viewPaperOpen && (
        <ViewPaper
          id={id} studentId={studentId} setSubmittedExam={setSubmittedExam} setViewPaperOpen={setViewPaperOpen}/>
      )}
    </div>
  );
}