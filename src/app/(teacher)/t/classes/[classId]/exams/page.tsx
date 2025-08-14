// pages/teacher/exams.tsx (frontend page)
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";
import { format } from "date-fns";
import Loader from '@/components/ui/Loader';
import { Calendar, Clock, CheckCheck, X, FileText, BookOpen, GraduationCap, XCircle, PlusCircle } from 'lucide-react';
import { forceLogout as logoutAndRedirect } from "@/lib/logout-utils";
import { FaCopy } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";

// Updated Question Interface
interface Question {
  question: string;
  answer: string | string[] | null;
  options?: string[]; // Options are still part of the interface as manual entry can be MCQ
  isSelected: boolean;
  questionType: 'MCQ' | 'LONG_ANSWER' | "Both"; // Added questionType
  diagramImgURL?: string[];
}

interface TeacherClassSection {
  section: {
    id: string;
    name: string;
    batch: {
      id: string;
      batchName: string;
    };
    semester: {
      id: string;
      name: string;
    };
    maxStudents: number;
    enrolledStudents: Array<{
      studentId: string;
      name: string;
      email: string;
    }>;
  };
  course: {
    id: string;
    name: string;
    code: string;
    department: {
      id: string;
      name: string;
      code: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  } | null;
}

/*interface Exam {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
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
  examSubmissions: Array<{
    id: string;
    examId: string;
    studentId: string;
    submissionTime: Date | string;
    obtainedMarks: number;
    status: string;
    feedback?: string | null;
    gradedById?: string | null;
    gradedAt?: Date | string | null;
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
}*/

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
  questions: Array<{
    id: string;
    examId: string;
    questionText: string;
    questionType?: string; // This will now correctly reflect 'MCQ' or 'LONG_ANSWER'
    marks: number;
    options?: string[];
    correctAnswer?: string[];
    difficultyLevel?: string;
    diagramImgURL?: string[];
  }>;
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

export default function ExamsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'copy-check'>('view');

  // States for exam creation
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numLongQuestions, setNumLongQuestions] = useState<string>("0");
  const [numMCQQuestions, setNumMCQQuestions] = useState<string>("0");
  const [questionMode, setQuestionMode] = useState(false) // false for AI, true for Manual

  // New states for additional exam fields
  const [classSections, setClassSections] = useState<TeacherClassSection[]>([]);
  const [selectedClassSection, setSelectedClassSection] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("60");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [passingMarks, setPassingMarks] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // States for exam listing
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loadingExamDetails, setLoadingExamDetails] = useState(false);
  const [creditsData, setcreditsData] = useState<any>(null);

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>("Hard");


  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const [selectedQuestionType, setSelectedQuestionType] = useState<'MCQ' | 'LONG_ANSWER' | 'Both'>('MCQ');

  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [startPage, setStartPage] = useState<string>('1');
  const [endPage, setEndPage] = useState<string>('');
  const [instituteId, setInstituteId] = useState();
  const [instituteAdminId, setInstituteAdminId] = useState();

  const [uploadingDiagram, setUploadingDiagram] = useState(false);
  const [selectedQuestionForDiagram, setSelectedQuestionForDiagram] = useState<number | null>(null);

  useEffect(() => {
    console.log("All questions: ", questions);
  }, [questions]);

  useEffect(() => {
    const startDate = new Date(`${examDate}T${startTime}`);
    const endDate = new Date(`${examDate}T${endTime}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

  }, [startTime, endTime, examDate]);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const getData = async () => {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth() is zero-based
        const year = now.getFullYear();
        const result = await fetch(`/api/credits/${JSON.parse(localStorage.getItem("user")!).institutionId}?month=${month}&year=${year}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (result.ok) {
          const res = await result.json();
          setcreditsData(res);
          console.log(res);
        } else {
          alert("Error in fetching credits data");
        }
      }
      // getData();
    }
  }, [])

  const updateCoins = async (QuestionCount: Number) => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    const year = now.getFullYear();
    console.log("Current Credit Balance", creditsData)

    const result = await fetch(`/api/credits/${JSON.parse(localStorage.getItem("user")!).institutionId}?month=${month}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        questionPaperCreditsBalance: creditsData ? Number(creditsData?.questionPaperCreditsBalance) + (questionMode ? 0.5 * Number(QuestionCount) : Number(QuestionCount)) : 0,
        total: creditsData ? Number(creditsData?.total) + (questionMode ? 0.5 * Number(QuestionCount) : Number(QuestionCount)) : 0
      })

    })
    if (result.ok) {
      const res = await result.json();
    } else {
      // Handle error updating credits
    }
  }

  // Force logout and redirect to login
  const forceLogout = () => {
    const errorMessage = 'Your session was invalid. Please log in again.';
    // Use the utility function with a custom error message and delay
    logoutAndRedirect(errorMessage, 2000);
  };

  const uploadFileToS3 = async (file: File) => {
    try {
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
            // You can update a progress bar here if needed
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
    }
  };

  const processPdfForPreview = async (fileUrl: string) => {
    try {
      setIsProcessingPdf(true);
      setError("");

      const splitRes = await axios.post(`https://py.aiclassroom.in/process/`, {
        "file_url": fileUrl,
        "file_uid": uuidV4()
      });

      const pageImages = splitRes.data["Pdf_Pages_Data"];
      if (!pageImages || pageImages.length === 0) {
        setError("Could not process the PDF or the PDF is empty.");
        setPdfUrl("");
        return;
      }

      setPdfPageImages(pageImages);

      // MODIFIED: Set the new state variables to default to the full document range.
      const allPageNumbers = Array.from({ length: pageImages.length }, (_, i) => i + 1);
      setSelectedPages(allPageNumbers);
      setSelectedQuestionType('MCQ'); // Reset question type to default

      // Automatically set the page range inputs to the full document range
      setStartPage('1');
      setEndPage(String(pageImages.length));

    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("Failed to process PDF for preview. Please try another file.");
      setPdfUrl("");
      setPdfPageImages([]);
    } finally {
      setIsProcessingPdf(false);

    }
  };

  // --- NEW: Function to apply the user-defined page range ---
  const handleApplyPageRange = () => {
    const start = parseInt(startPage, 10);
    const end = parseInt(endPage, 10);
    const totalPages = pdfPageImages.length;

    if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
      setError(`Invalid page range. Please enter numbers between 1 and ${totalPages}.`);
      setSelectedPages([]); // Clear selection on error
      return;
    }
    setError("");

    // Create a simple array of page numbers
    const newSelectedPages = [];
    for (let i = start; i <= end; i++) {
      newSelectedPages.push(i);
    }
    // Update the state
    setSelectedPages(newSelectedPages);
  };


  // Check if user is authenticated as a teacher
  const checkAuthStatus = async () => {
    try {
      console.log("Checking authentication status...");

      // First try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      let userData = null;

      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
          console.log("Found stored user data:", userData);

          // If we have valid teacher data in localStorage, we can proceed
          if (userData?.role === 'TEACHER' && userData?.teacherId) {
            console.log("User is authenticated as a teacher based on localStorage");
            return true;
          }
        } catch (e) {
          console.error("Error parsing stored user data:", e);
        }
      }

      // If we don't have valid data in localStorage or it's not a teacher,
      // check with the server
      console.log("Checking authentication with server...");
      const response = await axios.get('/api/auth/session', {
        withCredentials: true
      });

      if (!response.data?.user?.role) {
        console.error("No valid user data in session");
        setError("You must be logged in as a teacher to access this page");
        forceLogout();
        return false;
      }

      if (response.data.user.role !== 'TEACHER') {
        console.error(`User role is ${response.data.user.role}, not TEACHER`);
        setError("Only teachers can access this page");
        forceLogout();
        return false;
      }

      // Fetch teacher details to get the teacherId if not already in the user data
      if (!response.data.user.teacherId) {
        try {
          const teacherResponse = await axios.get('/api/teacher/profile', {
            withCredentials: true
          });

          if (teacherResponse.data && teacherResponse.data.id) {
            // Add teacherId to user data
            response.data.user.teacherId = teacherResponse.data.id;
          } else {
            console.error("Teacher ID not found in profile data");
            setError("Teacher information not found");
            forceLogout();
            return false;
          }
        } catch (err) {
          console.error("Failed to fetch teacher profile:", err);
          setError("Failed to retrieve teacher information");
          forceLogout();
          return false;
        }
      }

      // Update localStorage with current user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log("User is authenticated as a teacher via API");
      return true;

    } catch (err) {
      console.error("Authentication check failed:", err);
      setError("Authentication failed. Please try logging in again.");
      forceLogout();
      return false;
    }
  };

  // Fetch exams and class sections on component mount
  useEffect(() => {
    // First check if we have authentication cookies
    const initPage = async () => {
      const isAuthenticated = await checkAuthStatus();

      if (isAuthenticated) {
        // Then fetch the data
        fetchExams();
        fetchClassSections();
      }
    };

    initPage();
  }, []);

  const fetchClassSections = async () => {
    try {
      // Get the user data from localStorage to extract teacherId
      const storedUser = localStorage.getItem('user');
      let teacherId = '';

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          teacherId = userData?.teacherId;
          setInstituteId(userData?.institutionId)
          if (!teacherId) {
            setError("Teacher ID not found");
            return;
          }
        } catch (e) {
          console.error("Error parsing stored user data:", e);
          setError("Error retrieving teacher information");
          return;
        }
      } else {
        setError("User information not found");
        return;
      }

      // Call the new API endpoint with the teacherId
      const response = await axios.get(`/api/teachers/${teacherId}/section`, {
        withCredentials: true
      });

      // Update state with the response data
      setClassSections(response.data);

      // If there are class sections, select the first one by default
      if (response.data.length > 0) {
        setSelectedClassSection(response.data[0].section.id);
      }

    } catch (err: any) {
      console.error("Error fetching class sections:", err);
      setError(err.response?.data?.error || "Failed to fetch class sections");
    }
  };

  const fetchExams = async () => {
    const storedData = localStorage.getItem('user');
    const userData = storedData ? JSON.parse(storedData) : null;
    try {
      setLoadingExams(true);
      const response = await axios.get(`/api/exam/list/${userData.id}`, {
        withCredentials: true,
      });

      console.log("Fetched exams: ", response.data.exams);
      setExams(response.data.exams);
    } catch (err: any) {
      console.error("Error fetching exams:", err);
      setError(err.response?.data?.error || "Failed to fetch exams");
    } finally {
      setLoadingExams(false);
    }
  };

  /*  const extractQuestions = async () => {
      if (!pdfUrl) {
        setError("Please enter a PDF URL");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post("/api/extract-questions", {
          pdfUrl,
          numQuestions: parseInt(numLongQuestions) || 2
        }, {
          withCredentials: true
        });

        if (response.data.questions) {
          const extractedQuestions = response.data.questions.map((q: any) => ({
            ...q,
            options: [],
            isSelected: false,
            questionType: 'LONG_ANSWER', // AI generated questions are now explicitly LONG_ANSWER
          }));
          setQuestions(extractedQuestions);
          setTotalMarks(extractedQuestions.length.toString());
          setPassingMarks(Math.ceil(extractedQuestions.length * 0.4).toString());
          setError("");
        }
      } catch (err: any) {
        console.error("Error extracting questions:", err);
        setError(err.response?.data?.error || "Failed to extract questions");
      } finally {
        setLoading(false);
      }
    };*/

  const today = new Date().toISOString().split('T')[0];

  // NEW: Handler for when the duration is changed
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDurationMinutes(newDuration);

    // If a start time is already set, automatically calculate the end time
    if (startTime && newDuration && parseInt(newDuration) > 0) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      startDate.setMinutes(startDate.getMinutes() + parseInt(newDuration, 10));

      const newEndTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  };

  // NEW: Handler for when the start time is changed
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    // If a duration is already set, automatically calculate the end time
    if (newStartTime && durationMinutes && parseInt(durationMinutes) > 0) {
      const [hours, minutes] = newStartTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      startDate.setMinutes(startDate.getMinutes() + parseInt(durationMinutes, 10));

      const newEndTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  };

  // NEW: Handler for when the end time is changed
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);

    // If a start time is already set, automatically calculate the duration
    if (startTime && newEndTime) {
      const startDate = new Date(`1970-01-01T${startTime}:00`);
      const endDate = new Date(`1970-01-01T${newEndTime}:00`);

      // Handle cases where the exam ends on the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const diffInMillis = endDate.getTime() - startDate.getTime();
      const diffInMinutes = Math.round(diffInMillis / 60000); // 60000ms in a minute

      if (diffInMinutes > 0) {
        setDurationMinutes(String(diffInMinutes));
      }
    }
  };

  const handleCreateExam = async () => {
    // console.log('instituteid --- ', instituteId);
    // try {
    //   const instResponse = await axios.get(`http://localhost:3000/api/institutions/${instituteId}/getadmin`);
    //   console.log('instResponse ---', instResponse);
    //   console.log('instResponse id ---', instResponse?.data?.id);

    //   const coinRes = await axios.get(`http://localhost:3000/api/coins/${instResponse?.data?.id}`);
    //   console.log('coinRes ---', coinRes);

    //   const resul1 = await axios.post(`/api/coins/${instResponse?.data?.id}?coins=4`, null, {
    //     headers: {
    //       "Content-Type": "application/json"
    //     }
    //   });

    //   const coinRes2 = await axios.get(`http://localhost:3000/api/coins/${instResponse?.data?.id}`);
    //   console.log('coinRes ---', coinRes2);

    // } catch (err) {
    //   console.log(err);
    // }


    // alert("failed create exam");
    // return;

    setError("");
    const selectedQuestions = questions.filter((q) => q.isSelected)
      .map(({ question, answer, options, questionType, diagramImgURL }) => ({
        question,
        answer,
        options,
        questionType,
        diagramImgURL
      }));

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question");
      return;
    }

    // Validation for question-specific fields
    for (const q of selectedQuestions) {
      if (!q.question.trim()) {
        setError("All selected questions must have text.");
        return;
      }

      if (!q.answer || (Array.isArray(q.answer) && q.answer.length === 0) || (typeof q.answer === 'string' && !q.answer.trim())) {
        setError(`Question "${q.question}" must have an answer.`);
        return;
      }

      if (q.questionType === 'MCQ') {
        if (!q.options || q.options.length < 2 || q.options.some(opt => !opt.trim())) {
          setError(`MCQ question "${q.question}" must have at least two non-empty options.`);
          return;
        }

        // For MCQ, ensure the answer is one of the options (case-insensitive and trim)
        if (typeof q.answer === 'string' && !q.options.map(opt => opt.trim().toLowerCase()).includes(q.answer.trim().toLowerCase())) {

          setError(`MCQ question ${q.question}'s answer must be one of the provided options.`);
          return;
        }
      }
    }


    if (!examTitle.trim()) {
      setError("Please enter an exam title");
      return;
    }

    if (!selectedClassSection) {
      setError("Please select a class section");
      return;
    }

    if (!examDate || !startTime || !endTime) {
      setError("Please set exam date and time");
      return;
    }

    if (!durationMinutes || parseInt(durationMinutes) < 1) {
      setError("Please set a valid duration");
      return;
    }

    if (!totalMarks || parseInt(totalMarks) < 1) {
      setError("Please set valid total marks");
      return;
    }

    if (!passingMarks || parseInt(passingMarks) < 1) {
      setError("Please set valid passing marks");
      return;
    }

    /*//coin things
    console.log('instituteid --- ', instituteId);
    try {
      const instResponse = await axios.get(`/api/institutions/${instituteId}/getadmin`);
      console.log('instResponse ---', instResponse);
      console.log('instResponse id ---', instResponse?.data?.id);

      const coinRes = await axios.get(`/api/coins/${instResponse?.data?.id}`);
      console.log('coinRes ---', coinRes);

      let coinsToDeduct = selectedQuestions.length * 0.2;

      if (coinRes.data.coins < coinsToDeduct) {
        alert('Institute dosenot have enough Coins! Please Contact Institute Admin.');
        return;
      }

      const resul1 = await axios.post(`/api/coins/${instResponse?.data?.id}?coins=${coinsToDeduct}`, null, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const coinRes2 = await axios.get(`/api/coins/${instResponse?.data?.id}`);
      console.log('coinRes ---', coinRes2);

    } catch (err) {
      console.log(err);
    }*/

    try {
      setLoading(true);
      // updateCoins(questions.length)
      const startDate = new Date(`${examDate}T${startTime}`);
      const endDate = new Date(`${examDate}T${endTime}`);

      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const startTimeISO = startDate.toISOString();
      const endTimeISO = endDate.toISOString();
      const response = await axios.post(
        "/api/exam/create", // Ensure this path is correct based on your API route file
        {
          userId: JSON.parse(localStorage.getItem('user')!),
          title: examTitle,
          questions: selectedQuestions,
          classSectionId: selectedClassSection,
          durationMinutes: parseInt(durationMinutes),
          totalMarks: parseInt(totalMarks),
          passingMarks: parseInt(passingMarks),
          examDate,
          isAiGenerated: false,
          difficultyLevel: difficulty,
          startTime: startTimeISO,
          endTime: endTimeISO,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Reset form and fetch updated exams
        setExamTitle("");
        setQuestions([]);
        setPdfUrl("");
        setDurationMinutes("60");
        setTotalMarks("");
        setPassingMarks("");
        setNumLongQuestions("2");
        setError("");
        setActiveTab('view');

        fetchExams();
      }
    } catch (err: any) {
      console.error("Error creating exam:", err);
      setError(err.response?.data?.error || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };
const takeoutQuestions = (response: any): Question[] => {
  const questions: Question[] = [];
  if (response && response.questions && Array.isArray(response.questions)) {
    response.questions.forEach((q: any) => {
      if (q.title) {
        const question: Question = {
          question: q.title,
          options: q.options,
          answer: q.correct,
          isSelected: false,
          questionType: q.options.length > 0 ? 'MCQ' : 'LONG_ANSWER',
        };
        questions.push(question);
      }
    });
  }
  return questions;
};

  const mapApiResponseToQuestions = (response: any): Question[] => {
    setError("");
    const mappedQuestions: Question[] = [];
    const questionCount = response.question_count;

    if (!questionCount || typeof questionCount !== 'number' || questionCount <= 0) {
      return [];
    }

    const firstQuestionData = response['q_1'];

    const questionType: 'MCQ' | 'LONG_ANSWER' =
      firstQuestionData && Array.isArray(firstQuestionData.options) && firstQuestionData.options.length > 0
        ? 'MCQ'
        : 'LONG_ANSWER';

    for (let i = 1; i <= questionCount; i++) {
      const key = `q_${i}`;
      const rawQuestion = response[key];

      if (!rawQuestion) {
        console.warn(`Skipping question q_${i}: Data is missing in the API response.`);
        continue;
      }

      let newQuestion: Question | null = null;

      if (questionType === 'MCQ') {
        if (!rawQuestion.title || !rawQuestion.correct || !Array.isArray(rawQuestion.options) || rawQuestion.options.length === 0) {
          console.warn(`Skipping invalid MCQ q_${i}: Missing title, correct answer, or options.`, rawQuestion);
          continue;
        }

        const correctLetter = rawQuestion.correct.trim().toLowerCase();
        const index = correctLetter.charCodeAt(0) - 97;
        const optionText = rawQuestion.options[index];

        if (!optionText) {
          console.warn(`Skipping invalid MCQ q_${i}: Correct answer letter '${correctLetter}' does not correspond to a valid option.`, rawQuestion);
          continue;
        }

        const correctAnswerText = optionText.substring(optionText.indexOf(' ') + 1).trim();
        const cleanedOptions = rawQuestion.options.map((opt: string) => opt.replace(/^[a-zA-Z][\.\)]\s*/, '').trim());
        newQuestion = {
          question: rawQuestion.title,
          options: cleanedOptions,
          answer: correctAnswerText,
          isSelected: false,
          questionType: 'MCQ',
        };

      } else {
        if (!rawQuestion.title || !rawQuestion.correct) {
          console.warn(`Skipping invalid Long Answer q_${i}: Missing title or correct answer.`, rawQuestion);
          continue;
        }

        newQuestion = {
          question: rawQuestion.title,
          options: [],
          answer: rawQuestion.correct,
          isSelected: false,
          questionType: 'LONG_ANSWER',
        };
      }

      if (
        newQuestion &&
        newQuestion.question?.trim() &&
        newQuestion.answer &&
        (typeof newQuestion.answer === 'string' && newQuestion.answer.trim() !== '')
      ) {
        mappedQuestions.push(newQuestion);
      } else {
        console.warn(`Discarding a malformed question object due to empty title or answer after processing. Original data:`, rawQuestion);
      }
    }

    return mappedQuestions;
  };

  // --- MODIFIED handleGenerateAiQuestions function ---
  const handleGenerateAiQuestions = async () => {
    // console.log('instituteId -- ', instituteId)
    // alert('failed');
    // return;
    try {
      setError("");
      // All previous validations remain
      if ((Number(numLongQuestions) < 2 && Number(numMCQQuestions) === 0) || (Number(numLongQuestions) === 0 && Number(numMCQQuestions) < 2)) {
        setError("Please select at least one question type for AI generated questions (MCQ/Long Question). You can select multiple pages for each question type.");
        return;
      }
      if (!examTitle.trim()) {
        setError("Please enter an exam title");
        return;
      }
      if (!selectedClassSection) {
        setError("Please select a class section");
        return;
      }
      if (!examDate || !startTime || !endTime) {
        setError("Please set exam date and time");
        return;
      }
      if (!durationMinutes || parseInt(durationMinutes) < 1) {
        setError("Please set a valid duration");
        return;
      }
      if (!totalMarks || parseInt(totalMarks) < 1) {
        setError("Please set valid total marks");
        return;
      }
      if (!passingMarks || parseInt(passingMarks) < 1) {
        setError("Please set valid passing marks");
        return;
      }

      // New validation for PDF and question type setup
      if (!pdfUrl || selectedPages.length === 0) { // New check
        setError("Please upload a PDF and apply a page range before creating the exam.");
        return;
      }

      setLoading(true);

      // Filter pages based on user selection from aiQuestionType state
      // --- NEW LOGIC ---
      let mcqPageImages: string[] = [];
      let longPageImages: string[] = [];

      // Check the single dropdown's value to decide which lists to populate
      if (selectedQuestionType === 'MCQ' || selectedQuestionType === 'Both') {
        // Get image URLs for all selected pages for MCQs
        mcqPageImages = selectedPages.map(pgNum => pdfPageImages[pgNum - 1]);
      }

      if (selectedQuestionType === 'LONG_ANSWER' || selectedQuestionType === 'Both') {
        // Get image URLs for all selected pages for Long Answers
        longPageImages = selectedPages.map(pgNum => pdfPageImages[pgNum - 1]);
      }

      let allQuestions: Array<Question> = [];
     

      // Generate MCQ questions if pages were selected for it
      // if (mcqPageImages.length > 0) {
      //   const generateMcqQuestions = await axios.post(`https://question-generation-2-5c1d46f-v5.app.beam.cloud`, {
      //     img_url_list: mcqPageImages,
      //     no_of_questions: parseInt(numMCQQuestions) * 2,
      //     uid: uuidV4(),
      //     type_and_question_level: `${difficulty} Level MCQ questions`
      //   }, {
      //     headers: {
      //       Authorization: `Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==`
      //     }
      //   });
      //   allQuestions = [...allQuestions, ...mapApiResponseToQuestions(generateMcqQuestions.data)];
      // }


      //coin things
      console.log('instituteid --- ', instituteId);
      try {
        const instResponse = await axios.get(`/api/institutions/${instituteId}/getadmin`);
        console.log('instResponse ---', instResponse);
        console.log('instResponse id ---', instResponse?.data?.id);

        const coinRes = await axios.get(`/api/coins/${instResponse?.data?.id}`);
        console.log('coinRes ---', coinRes);

        let coinsToDeduct = allQuestions.length * 0.2;

        if (coinRes.data.coins < coinsToDeduct) {
          alert('Institute dosenot have enough Coins! Please Contact Institute Admin.');
          return;
        }

        const resul1 = await axios.post(`/api/coins/${instResponse?.data?.id}?coins=${coinsToDeduct}`, null, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        const coinRes2 = await axios.get(`/api/coins/${instResponse?.data?.id}`);
        console.log('coinRes ---', coinRes2);

      } catch (err) {
        console.log(err);
      }
 if( mcqPageImages.length >= 0 || longPageImages.length >= 0) {
        const generateMixedQuestions = await axios.post(`https://py.aiclassroom.in/generate_questions_mixed`, {
          image_urls: [...mcqPageImages, ...longPageImages],
          total_mcq: parseInt(numMCQQuestions),
          total_long: parseInt(numLongQuestions),
          question_type_long: `${difficulty} Level long questions for General Test`,
          question_type_mcq: `${difficulty} Level MCQ questions for General Test`
        }, {
        });
        console.log("Mixed questions ", generateMixedQuestions.data);
        allQuestions = [...allQuestions, ...takeoutQuestions(generateMixedQuestions.data)];
      }else{
        setError("Please select at least one page for question generation.");
        setLoading(false);
        return;
      }

      // Generate Long Answer questions if pages were selected for it
      // if (longPageImages.length > 0) {
      //   const generateLongQuestions = await axios.post(`https://question-generation-2-5c1d46f-v5.app.beam.cloud`, {
      //     img_url_list: longPageImages,
      //     no_of_questions: parseInt(numLongQuestions) * 2,
      //     uid: uuidV4(),
      //     type_and_question_level: `${difficulty} Level Long Answer questions`
      //   }, {
      //     headers: {
      //       Authorization: `Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==`
      //     },
      //   });

      //   console.log("Long questions ", generateLongQuestions.data);
      //   allQuestions = [...allQuestions, ...mapApiResponseToQuestions(generateLongQuestions.data)];
      // }

      if (allQuestions.length === 0) {
        setError("No questions could be generated. This might be due to the content of the PDF or the page selections. Please review and try again.");
        setLoading(false);
        return;
      }
      console.log("All questions ", allQuestions);

      // Use the generated questions directly in the API call
      setQuestions(allQuestions);

      setLoading(false);

    } catch (err: any) {
      console.error("Error creating exam:", err);
      setError(err.response?.data?.error || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAiExams = async () => {
    // console.log('instituteid --- ', instituteId);
    // alert("failed ai exam");
    // return;
    try {
      const selectedQuestions = questions.filter((q) => q.isSelected)
        .map(({ question, answer, options, questionType, diagramImgURL }) => ({
          question,
          answer,
          options,
          questionType,
          diagramImgURL
        })); // Include questionType

      if (selectedQuestions.length === 0) {
        setError("Please select at least one question");
        return;
      }

      // Validation for question-specific fields
      for (const q of selectedQuestions) {
        if (!q.question.trim()) {
          setError("All selected questions must have text.");
          return;
        }

        if (!q.answer || (Array.isArray(q.answer) && q.answer.length === 0) || (typeof q.answer === 'string' && !q.answer.trim())) {
          setError(`Question "${q.question}" must have an answer.`);
          return;
        }

        if (q.questionType === 'MCQ') {
          if (!q.options || q.options.length < 2 || q.options.some(opt => !opt.trim())) {
            setError(`MCQ question "${q.question}" must have at least two non-empty options.`);
            return;
          }
          console.log("Line 526 ", q.options, "  ", q.answer)
          // For MCQ, ensure the answer is one of the options (case-insensitive and trim)
          if (typeof q.answer === 'string' && !q.options.map(opt => opt.trim().toLowerCase()).includes(q.answer.trim().toLowerCase())) {
            setError(`MCQ question ${q.question}'s answer must be one of the provided options.`);
            return;
          }
        }
      }

      if ((Number(numLongQuestions) < 2 && Number(numMCQQuestions) === 0) || (Number(numLongQuestions) === 0 && Number(numMCQQuestions) < 2)) {
        setError("Please select at least one question type for AI generated questions (MCQ/Long Question). You can select multiple pages for each question type.");
        return;
      }

      if (!examTitle.trim()) {
        setError("Please enter an exam title");
        return;
      }
      if (!selectedClassSection) {
        setError("Please select a class section");
        return;
      }
      if (!examDate || !startTime || !endTime) {
        setError("Please set exam date and time");
        return;
      }
      if (!durationMinutes || parseInt(durationMinutes) < 1) {
        setError("Please set a valid duration");
        return;
      }
      if (!totalMarks || parseInt(totalMarks) < 1) {
        setError("Please set valid total marks");
        return;
      }
      if (!passingMarks || parseInt(passingMarks) < 1) {
        setError("Please set valid passing marks");
        return;
      }

      // New validation for PDF and question type setup
      if (!pdfUrl || selectedPages.length === 0) {
        setError("Please upload a PDF and apply a page range before creating the exam.");
        return;
      }

      setLoading(true);
      const response = await axios.post("/api/exam/create", {
        userId: JSON.parse(localStorage.getItem('user')!),
        title: examTitle,
        questions: selectedQuestions, // Use the locally generated list, not the state variable
        classSectionId: selectedClassSection,
        durationMinutes: parseInt(durationMinutes),
        totalMarks: parseInt(totalMarks),
        passingMarks: parseInt(passingMarks),
        examDate,
        difficultyLevel: difficulty,
        isAiGenerated: true,
        startTime: `${examDate}T${startTime}`,
        endTime: `${examDate}T${endTime}`,
      });

      if (response.data.success) {
        // Reset form and fetch updated exams
        setExamTitle("");
        setQuestions([]);
        setPdfUrl("");
        setPdfPageImages([]);      // Reset new state
        setSelectedQuestionType('MCQ');   // Reset new state
        setDurationMinutes("60");
        setTotalMarks("");
        setPassingMarks("");
        setNumLongQuestions("1");
        setNumMCQQuestions("1");
        setError("");
        setActiveTab('view');
        fetchExams();
      }

    } catch (err: any) {
      console.error("Error creating exam:", err);
      setError(err.response?.data?.error || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  }

  const toggleQuestionSelection = (index: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === index ? { ...q, isSelected: !q.isSelected } : q
      )
    );
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options![oIndex] = value;
      }
      return newQuestions;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      if (!newQuestions[qIndex].options) {
        newQuestions[qIndex].options = [];
      }
      newQuestions[qIndex].options!.push('');
      return newQuestions;
    });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options!.splice(oIndex, 1);
      }
      return newQuestions;
    });
  };

  const handleDiagramUpload = async (event: React.ChangeEvent<HTMLInputElement>, questionIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDiagram(true);
    setSelectedQuestionForDiagram(questionIndex);

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setQuestions(prevQuestions => prevQuestions.map((q, idx) => {
        if (idx === questionIndex) {
          const diagramImgURL = [...(q.diagramImgURL || []), imageUrl];
          return { ...q, diagramImgURL };
        }
        return q;
      }));
    } catch (error) {
      console.error("Failed to upload diagram:", error);
      setError("Failed to upload diagram. Please try again.");
    } finally {
      setUploadingDiagram(false);
      setSelectedQuestionForDiagram(null);
      event.target.value = ''; // Reset file input
    }
  };

  const handleRemoveDiagram = (questionIndex: number, diagramIndex: number) => {
    setQuestions(prevQuestions => prevQuestions.map((q, idx) => {
      if (idx === questionIndex && q.diagramImgURL) {
        const diagramImgURL = q.diagramImgURL.filter((_, i) => i !== diagramIndex);
        return { ...q, diagramImgURL };
      }
      return q;
    }));
  };

  const handleQuestionTypeChange = (qIndex: number, type: 'MCQ' | 'LONG_ANSWER') => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[qIndex].questionType = type;
      // Clear options if switching to LONG_ANSWER, or initialize for MCQ if needed
      if (type === 'LONG_ANSWER') {
        newQuestions[qIndex].options = []; // Clear options for long answer
        if (Array.isArray(newQuestions[qIndex].answer)) {
          newQuestions[qIndex].answer = ''; // Long answer expects a single string answer
        }
      } else {
        // Ensure options array exists and has some initial empty options for MCQ
        if (!newQuestions[qIndex].options || newQuestions[qIndex].options.length === 0) {
          newQuestions[qIndex].options = ['', '', '', ''];
        }
        // If current answer is array (e.g., from a past long answer type that allowed multiple lines),
        // convert to string or clear it for MCQ.
        if (Array.isArray(newQuestions[qIndex].answer)) {
          newQuestions[qIndex].answer = newQuestions[qIndex].answer[0] || ''; // Take first element or empty
        }
      }
      return newQuestions;
    });
  };


  const fetchExamDetails = async (examId: string) => {
    try {
      setLoadingExamDetails(true);
      const response = await axios.get(`/api/exam/${examId}/${JSON.parse(localStorage.getItem('user')!).id}`, {
        withCredentials: true,
      });
      setSelectedExam(response.data.exam);
    } catch (err: any) {
      console.error("Error fetching exam details:", err);
      setError(err.response?.data?.error || "Failed to fetch exam details");
    } finally {
      setLoadingExamDetails(false);
    }
  };

  const handleExamDelete = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      const temp = localStorage.getItem('user');
      if (!temp) {
        setError('User information not found');
        return;
      }

      const userData = JSON.parse(temp);
      const teacherId = userData.teacherId || userData.id;

      if (!teacherId) {
        setError('Teacher ID not found');
        return;
      }

      const response = await axios.delete(`/api/exam/${examId}/${teacherId}`);
      console.log('delete response ---', response);

      // Refresh the exams list after successful deletion
      fetchExams();

      // Show success message (optional)
      // You could add a success state if you want to show a success message

    } catch (err: any) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.error || 'Failed to delete exam');
    }
  };

  const closeExamDetails = () => {
    setSelectedExam(null);
  };

  return (
    <div className="container mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create and manage exams for your classes</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'view'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              View Exams
            </span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'create'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Exam
            </span>
          </button>

          <button
            onClick={() => setActiveTab('copy-check')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'copy-check'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'}
            `}>

            <span className="flex items-center gap-2">
              <FaCopy className="h-5 w-5" />
              Copy Check
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-start">
            <X className="h-5 w-5 mr-2 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        // Create Exam Form
        <div className="bg-white shadow-md rounded-lg overflow-visible">

          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => {
                  setQuestionMode(!questionMode);
                  setQuestions([]); // Clear questions when switching mode for a clean slate
                  setPdfUrl(''); // Clear PDF URL as well
                }}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors shadow-sm border
                  ${!questionMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                    : "bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-300"
                  }`}
              >
                {!questionMode ? "Switch to Manual Entry" : "Switch to AI Generator"}
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Create New Exam</h2>
            <p className="text-gray-500 text-sm mt-1">Fill the form below to create a new exam</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter exam title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Section
                  </label>
                  <select
                    value={selectedClassSection}
                    onChange={(e) => setSelectedClassSection(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Class Section</option>
                    {classSections.map((item) => (
                      <option key={item.section.id} value={item.section.id}>
                        {item.section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Duration (minutes)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    // --- Use the new handler ---
                    onChange={handleDurationChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    min="1"
                  />
                </div>

                {/* Total Marks and Passing Marks inputs remain the same */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      Total Marks
                    </span>
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <CheckCheck className="h-4 w-4" />
                      Passing Marks
                    </span>
                  </label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Exam Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Start Time
                    </span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    // --- Use the new handler ---
                    onChange={handleStartTimeChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      End Time
                    </span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    // --- Use the new handler ---
                    onChange={handleEndTimeChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {!questionMode && (
                <div className="bg-gray-50 p-4 rounded-lg border h-fit border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Question Generator (AI)</h3>
                  {/* The main grid container now correctly holds three child divs for a 3-column layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                    {/* Column 2: Number of Questions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Questions (Long Answer)
                      </label>
                      <input
                        type="number"
                        value={numLongQuestions}
                        min={0}
                       // disabled={selectedQuestionType !== 'LONG_ANSWER' && selectedQuestionType !== 'Both'}
                        onChange={(e) => setNumLongQuestions(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of MCQ Questions
                      </label>
                      <input
                        type="number"
                        value={numMCQQuestions}
                        min={0}
                        disabled={selectedQuestionType !== 'MCQ' && selectedQuestionType !== 'Both'}
                        onChange={(e) => setNumMCQQuestions(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Column 1: Upload PDF */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload PDF
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        // --- MODIFIED onChange Handler ---
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"

                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoading(true); // Shows general loading for upload
                              setError("");
                              setPdfPageImages([]); // Reset previous PDF states
                              setSelectedPages([]);
                              setSelectedQuestionType('MCQ');
                              const result = await uploadFileToS3(file);
                              setPdfUrl(result.url); // Set URL
                              await processPdfForPreview(result.url); // Immediately process it

                            } catch (err) {
                              setPdfUrl("")
                              setError("Failed to upload PDF. Please try again.");
                            } finally {

                              setLoading(false);
                              setIsProcessingPdf(false);
                            }
                          }
                        }}
                      />

                      {pdfUrl && (
                        <div className="mt-2 text-xs text-green-700 break-all">
                          Uploaded:{" "}
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {pdfUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choose Difficulty Level
                      </label>
                      {/* The input has been changed to a select dropdown */}
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    {/* --- MODIFICATION END --- */}
                  </div>


                  {/* --- NEW UI: PDF Preview and Page Configuration --- */}
                  {isProcessingPdf && (
                    <div className="text-center p-4 my-4 bg-white rounded-lg border">
                      <Loader size="medium" />
                      <p className="mt-2 text-gray-600 animate-pulse">Processing your PDF, please
                        wait...</p>
                    </div>
                  )}

                 {pdfPageImages.length > 0 && (
  <div className="mt-6 border-t pt-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">PDF
      Preview & Page
      Configuration</h3>
    <div className="grid grid-cols-12 gap-6">
      {/* Left Side: PDF Preview */}
      {/* On mobile, this will be full width (col-span-12). */}
      {/* On medium screens and up, it will take up 7 columns (md:col-span-7). */}
      <div
        className="col-span-12 md:col-span-7 bg-white p-4 border rounded-lg max-h-[75vh] shadow-inner overflow-y-scroll">
        <div className="space-y-4">
          {pdfPageImages.map((imgSrc, index) => (
            <div key={index} id={`page-preview-${index + 1}`}
              className="border rounded-lg p-2">
              <img src={imgSrc} alt={`Page ${index + 1}`}
                className="w-full h-auto rounded shadow" />
              <p className="text-center text-sm font-medium text-gray-600 mt-2">Page {index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Page Configuration */}
      {/* On mobile, this will also be full width (col-span-12). */}
      {/* On medium screens and up, it will take up 5 columns (md:col-span-5). */}
      {/* It will now stack below the PDF preview on small screens. */}
      <div
        className="col-span-12 md:col-span-5 flex flex-col gap-4">
        {/* --- Page Range and Type Selection UI --- */}
        <div
          className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Select Page
              Range</h4>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-center"
                placeholder="Start"
                min="1"
              />
              <span className="text-gray-600">to</span>
              <input
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-center"
                placeholder="End"
                max={pdfPageImages.length}
              />
            </div>
            <button
              onClick={handleApplyPageRange}
              className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Apply Range
            </button>
            {selectedPages.length > 0 && (
              <p className="text-sm text-center text-green-700 mt-2">
                Active range:
                Page {selectedPages[0]} to {selectedPages[selectedPages.length - 1]}
              </p>
            )}
          </div>

          <hr />

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Select
              Question Type</h4>
            <select
              value={selectedQuestionType}
              onChange={(e) => setSelectedQuestionType(e.target.value as 'MCQ' | 'LONG_ANSWER' | 'Both')}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500"
            >
              <option value="MCQ">MCQ Questions</option>
              <option value="LONG_ANSWER">Long Answer Questions
              </option>
              <option value="Both">Both MCQ and Long Answer</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
                </div>
              )}


              {questionMode && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Manual Question Entry</h3>
                  <div className="space-y-4">
                    {questions.map((q, idx) => (

                      <div key={idx} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Question {idx + 1}
                          </label>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={e => {
                            const updated = [...questions];
                            updated[idx].question = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mb-3"
                          placeholder={`Enter Question ${idx + 1}`}
                        />

                        {/* Question Type Selector */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                          </label>
                          <select
                            value={q.questionType}
                            onChange={e => handleQuestionTypeChange(idx, e.target.value as 'MCQ' | 'LONG_ANSWER')}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                          >
                            <option value="MCQ">MCQ (Multiple Choice)</option>
                            <option value="LONG_ANSWER">Long Answer</option>
                          </select>
                        </div>

                        {/* Options for MCQ - conditionally rendered */}
                        {q.questionType === 'MCQ' && (
                          <div className="space-y-2 mb-3">
                            <label
                              className="block text-sm font-medium text-gray-700">Options:</label>
                            {q.options?.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={e => handleOptionChange(idx, oIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveOption(idx, oIndex)}
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" /> Add Option
                            </button>
                          </div>
                        )}

                        {/* Correct Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer
                          </label>
                          {q.questionType === 'MCQ' ? (
                            <input
                              type="text"
                              value={typeof q.answer === "string" ? q.answer : ""}
                              onChange={e => {
                                const updated = [...questions];
                                updated[idx].answer = e.target.value;
                                setQuestions(updated);
                              }}
                              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                              placeholder="Enter correct answer (must match an option)"
                            />
                          ) : (
                            <textarea
                              value={typeof q.answer === "string" ? q.answer : ""}
                              onChange={e => {
                                const updated = [...questions];
                                updated[idx].answer = e.target.value;
                                setQuestions(updated);
                              }}
                              rows={3}
                              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                              placeholder="Enter detailed expected answer"
                            ></textarea>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                      onClick={() =>
                        setQuestions([
                          ...questions,
                          {
                            question: "",
                            answer: "",
                            options: ['', '', '', ''],
                            isSelected: true,
                            questionType: 'LONG_ANSWER'
                          } // Default new question to LONG_ANSWER
                        ])
                      }
                    >
                      Add New Question
                    </button>
                  </div>
                </div>
              )}

              {questions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
                  <div className="p-4 bg-purple-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-purple-800">
                        {questionMode ? "Manual Entry Questions" : "Generated Questions"} ({questions.filter(q => q.isSelected).length}/{questions.length} selected)
                      </h3>
                      <button
                        className="text-xs text-purple-700 hover:text-purple-900"
                        onClick={() => setQuestions(questions.map(q => ({
                          ...q,
                          isSelected: true
                        })))}
                      >
                        Select All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {questions.map((q: Question, index) => (
                      <div
                        key={index}
                        className={`p-4 transition-colors border-b border-gray-200 last:border-b-0 ${q.isSelected ? "bg-purple-50" : "hover:bg-gray-50"}`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={q.isSelected}
                            onChange={() => toggleQuestionSelection(index)}
                            className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <div className="w-full">
                            <p className="font-medium text-gray-800">Q{index + 1}: {q.question}</p>
                            <p className="text-sm text-gray-500 italic">Type: {q.questionType.replace('_', ' ')}</p>

                            {/* Existing MCQ options display */}
                            {q.questionType === 'MCQ' && q.options && q.options.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1 pl-4">
                                <span className="font-medium">Options: </span>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                  {q.options.map((option, i) => (
                                    <li key={i}>{option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Existing Answer display */}
                            <div className="text-sm text-gray-600 mt-1 pl-4">
                              <span className="font-medium">Answer: </span>
                              {q.answer ? (
                                <p className="pl-2 border-l-2 border-gray-300 mt-1">{q.answer}</p>
                              ) : (
                                <span className="italic">No answer available</span>
                              )}
                            </div>

                            {/* --- NEW: Diagram Upload Section --- */}
                            {q.questionType === 'LONG_ANSWER' && (
                              <div className="mt-4 pl-4">
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault(); // Prevent label click from toggling checkbox
                                      setSelectedQuestionForDiagram(index);
                                      document.getElementById(`diagram-upload-${index}`)?.click();
                                    }}
                                    disabled={(uploadingDiagram && selectedQuestionForDiagram === index) || q.diagramImgURL?.length == 1}
                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
                                    ${(uploadingDiagram && selectedQuestionForDiagram === index) || q.diagramImgURL?.length == 1 && 'disabled:opacity-50 cursor-not-allowed'}
                                    `}
                                  >
                                    {uploadingDiagram && selectedQuestionForDiagram === index ? 'Uploading...' : 'Add Diagram'}
                                  </button>
                                  <input
                                    type="file"
                                    id={`diagram-upload-${index}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleDiagramUpload(e, index)}
                                  />
                                </div>

                                {/* Diagram Previews */}
                                {q.diagramImgURL && q.diagramImgURL.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-3">
                                    {q.diagramImgURL.map((url, i) => (
                                      <div key={i} className="relative group">
                                        <img src={url} alt={`Diagram ${i + 1}`}
                                          className="h-24 w-24 object-cover rounded-lg border-2 border-purple-200" />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleRemoveDiagram(index, i)
                                          }}
                                          className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* --- END: Diagram Upload Section --- */}

                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-start">
              {!questionMode ? (
                <button
                  onClick={questions && questions.length > 0 ? handleCreateAiExams : handleGenerateAiQuestions}
                  disabled={loading || isProcessingPdf || !pdfUrl || pdfPageImages.length === 0}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
                >
                  {loading ? (
                    <>
                      {/* SVG Spinner */}
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      {/* Text */}
                      <span>{questions && questions.length > 0 ? "Creating Exam..." : isProcessingPdf ? "Processing pdf..." : "Generating Questions....."}</span>
                    </>
                  ) : (
                    <>{questions && questions.length > 0 ? "Create Exam" : "Generate Questions"}</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCreateExam}
                  disabled={loading}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? <Loader size="small" /> : "Create Exam"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'view' || activeTab === 'copy-check') && (
        // Exam List
        <div>
          {loadingExams ? (
            <div className="flex items-center justify-center h-64">
              {activeTab === 'view' && (<Loader size="large" message="Loading exams..." />)}
              {activeTab === 'copy-check' && (
                <Loader size="large" message="Fetching submitted exams..." />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No exams created yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first exam for this class</p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Create Your First Exam
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-800">{exam.title}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : exam.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : exam.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {exam.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                        <span>
                          {exam.classSection.batch.name} | {exam.classSection.semester.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{exam.durationMinutes} minutes</span>
                        </div>

                        {/*<div className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-1 text-gray-500"/>
                          <span>{exam.questions.length} questions</span>
                        </div>*/}

                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-1">Marks:</span>
                          <span>{exam.totalMarks} total</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-1">Pass:</span>
                          <span>{exam.passingMarks} marks</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{format(new Date(exam.examDate), "PPP")}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>
                            {format(new Date(exam.startTime), "p")} - {format(new Date(exam.endTime), "p")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex space-x-2 justify-end">
                      <button
                        className="px-3 py-1 bg-red-600 border border-red-600 rounded text-white text-sm hover:bg-red-700 transition-colors"
                        onClick={() => handleExamDelete(exam.id)}
                      >
                        Delete
                      </button>
                      {activeTab === 'view' && (<button
                        onClick={() => fetchExamDetails(exam.id)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      )}

                      {activeTab === 'copy-check' && (<button
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => router.push(`exams/submissions?examId=${exam.id}&teacherId=${JSON.parse(localStorage.getItem('user')!).id}`)}
                      >
                        View Submissions
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* {activeTab === 'copy-check' && (
        <ExamSubmissionsPage exams={exams}/>
      )}
*/}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{selectedExam.title}</h2>
              <button
                onClick={closeExamDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {selectedExam.classSection.batch.name} | {selectedExam.classSection.semester.name}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{format(new Date(selectedExam.examDate), "PPP")}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {format(new Date(selectedExam.startTime), "p")} - {format(new Date(selectedExam.endTime), "p")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{selectedExam.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="font-medium mr-1">Total Marks:</span>
                    <span>{selectedExam.totalMarks}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-1">Passing Marks:</span>
                    <span>{selectedExam.passingMarks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingExamDetails ? (
                <div className="flex items-center justify-center h-64">
                  <Loader size="medium" message="Loading exam details..." />
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Exam Questions
                    ({selectedExam.questions.length})</h3>

                  {selectedExam.questions.map((question, index) => (
                    <div key={question.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="mb-2 flex justify-between">
                        <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                        <span className="text-sm text-gray-500">
                          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                          {question.difficultyLevel ? ` • ${question.difficultyLevel}` : ''}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.questionText}</p>
                      <p
                        className="text-sm text-gray-500 italic">Type: {question.questionType?.replace('_', ' ')}</p> {/* Display type */}


                      {question.questionType === 'MCQ' && question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                          <ul className="space-y-1 ml-5 list-disc">
                            {question.options.map((option, i) => (
                              <li key={i} className="text-sm text-gray-600">{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {question.correctAnswer && question.correctAnswer.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-1">Correct
                            Answer:</p>
                          {question.correctAnswer.length === 1 ? (
                            <p className="text-sm text-gray-800">{question.correctAnswer[0]}</p>
                          ) : (
                            <ul className="space-y-1 ml-5 list-disc">
                              {question.correctAnswer.map((answer, i) => (
                                <li key={i}
                                  className="text-sm text-gray-800">{answer}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeExamDetails}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors mr-2"
              >
                Close
              </button>
              {/* <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Edit Exam
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}