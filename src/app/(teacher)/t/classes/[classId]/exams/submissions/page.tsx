"use client";

import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import {StudentSubmittedExams} from "@/components/teacher/StudentSubmittedExams";
import {Exam} from "@/types/exam";

// A simple component to display error messages
function ErrorDisplay({message}: { message: string }) {
  return (
    <div style={{color: 'red', padding: '20px'}}>
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
}


export default function ExamSubmissionsPage() {
  const searchParams = useSearchParams();
  const examId = searchParams?.get('examId');
  const teacherId = searchParams?.get('teacherId');

  const [submittedExam, setSubmittedExam] = useState<Exam| null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Only run the fetch if both IDs are available
    if (examId && teacherId) {
      const fetchSubmissions = async () => {
        try {
          setError(null); // Reset error state on new fetch
          setLoading(true);
          const {data} = await axios.get(`/api/exam/${examId}/submissions/${teacherId}`);
          setSubmittedExam(data.exam);

          console.log("Fetched exam submissions: ", data);
        } catch (e) {
          console.error("Failed to fetch exam submissions:", e);
          setError("Could not load the exam submissions. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchSubmissions();
    } else {
      setLoading(false);
      setError("Exam ID or Teacher ID is missing from the URL.");
    }
    // 3. Add examId and teacherId to the dependency array
  }, [examId, teacherId]);

  // 4. Handle all three states in the UI: loading, error, and success
  if (loading) {
    return <Loader size="large" message="Loading submissions..."/>;
  }

  if (error) {
    return <ErrorDisplay message={error}/>;
  }

  return (
    <div className={"p-6 w-full"}>
      {submittedExam ? (
        <div>
          <StudentSubmittedExams submittedExam={submittedExam}  setSubmittedExam={setSubmittedExam}/>
        </div>
      ) : (
        <p>No submissions found.</p>
      )}
    </div>
  );
}