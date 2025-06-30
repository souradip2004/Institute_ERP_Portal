// pages/teacher/exams.tsx (frontend page)

"use client";
import React, {useState, useEffect} from "react";
import axios from "axios";
import {v4 as uuidV4} from "uuid";
import {format} from "date-fns";
import Loader from '@/components/ui/Loader';
import {Calendar, Clock, CheckCheck, X, FileText, BookOpen, GraduationCap, XCircle, PlusCircle} from 'lucide-react';
import {forceLogout as logoutAndRedirect} from "@/lib/logout-utils";

// Updated Question Interface
interface Question {
  question: string;
  answer: string | string[] | null;
  options?: string[]; // Options are still part of the interface as manual entry can be MCQ
  isSelected: boolean;
  questionType: 'MCQ' | 'LONG_ANSWER'; // Added questionType
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

interface ClassSection {
  id: string;
  batch: {
    name: string;
  };
  semester: {
    name: string;
  };
}

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
    questionText: string;
    questionType?: string; // This will now correctly reflect 'MCQ' or 'LONG_ANSWER'
    marks: number;
    options?: string[];
    correctAnswer?: string[];
    difficultyLevel?: string;
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

interface ExamsPageProps {
  params: {
    classId: string;
  };
}

interface AiQuestionType {
  pgNo: number;
  questionType: "MCQ" | "LONG_ANSWER";
}

export default function ExamsPage({params}: ExamsPageProps) {
  const resolvedParams = React.use(params as any) as { classId: string };
  // Tab state
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');

  // States for exam creation
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState<string>("2");
  const [questionMode, setQuestionmode] = useState(false) // false for AI, true for Manual

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

  const [aiQuestionType, setAiQuestionType] = useState<Array<AiQuestionType>>([]);

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
      getData();
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
        withCredentials: true,
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
      setExams(response.data.exams);
    } catch (err: any) {
      console.error("Error fetching exams:", err);
      setError(err.response?.data?.error || "Failed to fetch exams");
    } finally {
      setLoadingExams(false);
    }
  };

  const extractQuestions = async () => {
    if (!pdfUrl) {
      setError("Please enter a PDF URL");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/extract-questions", {
        pdfUrl,
        numQuestions: parseInt(numQuestions) || 2
      }, {
        withCredentials: true
      });

      if (response.data.questions) {
        const extractedQuestions = response.data.questions.map((q: any) => ({
          ...q,
          // For AI generated long answers, options are not relevant, so we ensure it's empty
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
  };

  const handleCreateExam = async () => {
    const selectedQuestions = questions.filter((q) => q.isSelected)
    .map(({question, answer, options, questionType}) => ({question, answer, options, questionType})); // Include questionType

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
          setError(`MCQ question "${q.question}"'s answer must be one of the provided options.`);
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

    try {
      setLoading(true);
      updateCoins(questions.length)
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
          startTime: `${examDate}T${startTime}`,
          endTime: `${examDate}T${endTime}`,
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
        setNumQuestions("2");
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

  const mapApiResponseToQuestions = (response: any): Question[] => {
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

      // Skip if a question for a given index is missing in the response
      if (!rawQuestion) {
        continue;
      }

      let newQuestion: Question;

      if (questionType === 'MCQ') {
        const correctLetter = rawQuestion.correct.trim().toLowerCase();
        let correctAnswerText = '';
        if (correctLetter === 'a') {
          correctAnswerText = rawQuestion.options[0].split(' ')[1];
        } else if (correctLetter === 'b') {
          correctAnswerText = rawQuestion.options[1].split(' ')[1];
        } else if (correctLetter === 'c') {
          correctAnswerText = rawQuestion.options[2].split(' ')[1];
        } else if (correctLetter === 'd') {
          correctAnswerText = rawQuestion.options[3].split(' ')[1];
        }

        newQuestion = {
          question: rawQuestion.title,
          options: rawQuestion.options,
          answer: correctAnswerText, // The full option string is the answer
          isSelected: true, // Default initial state
          questionType: 'MCQ',
        };
      } else {
        newQuestion = {
          question: rawQuestion.title,
          options: [],
          answer: rawQuestion.correct,
          isSelected: true,
          questionType: 'LONG_ANSWER',
        };
      }
      mappedQuestions.push(newQuestion);
    }

    return mappedQuestions;
  };

  const handleCreateAiExam = async () => {
    try {

      if (Number(numQuestions) < 1) {
        setError("Please select a number of questions greater than 1");
      }

      setLoading(true);

      const mcqQuestions = aiQuestionType.filter(q => q.questionType === 'MCQ');

      const longQuestions = aiQuestionType.filter(q => q.questionType === "LONG_ANSWER");

      const splitRes = await axios.post(`https://py.aiclassroom.in/process/`,
        {
          "file_url": pdfUrl,
          "file_uid": uuidV4()
        }
      );

      const splitImages = splitRes.data["Pdf_Pages_Data"];

      let mcqPages = [];
      let longPages = [];

      for (let i = 0; i < splitImages.length; i++) {
        if (mcqQuestions.length > 0) {
          if (mcqQuestions.find(item => item.pgNo === (i + 1))) {
            mcqPages.push(splitImages[i]);
          }
        }

        if (longQuestions.length > 0) {
          if (longQuestions.find(item => item.pgNo === (i + 1))) {
            longPages.push(splitImages[i]);
          }
        }
      }

      let generateMcqQuestions = null;
      let allQuestions: Array<Question> = [];
      if (mcqQuestions.length > 0) {
        generateMcqQuestions = await axios.post(`https://question-generation-2-5c1d46f-v3.app.beam.cloud`, {
          img_url_list: mcqPages,
          no_of_questions: parseInt(numQuestions),
          uid: uuidV4(),
          type_and_question_level: `Medium Level MCQ questions`
        })

        allQuestions = mapApiResponseToQuestions(generateMcqQuestions.data);
      }


      let generateLongQuestions = null;

      if(longPages.length > 0){
        generateLongQuestions = await axios.post(`https://question-generation-2-5c1d46f-v3.app.beam.cloud`, {
          img_url_list: longPages,
          no_of_questions: parseInt(numQuestions),
          uid: uuidV4(),
          type_and_question_level: `Long Answer questions`
        });

        allQuestions = [...allQuestions, ...mapApiResponseToQuestions(generateLongQuestions.data)];
      }


      setQuestions(allQuestions);

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

      // updateCoins(questions.length)
      const response = await axios.post(
        "/api/exam/create", // Ensure this path is correct based on your API route file
        {
          userId: JSON.parse(localStorage.getItem('user')!),
          title: examTitle,
          questions: questions,
          classSectionId: selectedClassSection,
          durationMinutes: parseInt(durationMinutes),
          totalMarks: parseInt(totalMarks),
          passingMarks: parseInt(passingMarks),
          examDate,
          startTime: `${examDate}T${startTime}`,
          endTime: `${examDate}T${endTime}`,
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
        setNumQuestions("2");
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
        i === index ? {...q, isSelected: !q.isSelected} : q
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
              <BookOpen className="h-5 w-5"/>
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
              <FileText className="h-5 w-5"/>
              Create Exam
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-start">
            <X className="h-5 w-5 mr-2 mt-0.5"/>
            <p>{error}</p>
          </div>
        </div>
      )}

      {activeTab === 'create' ? (
        // Create Exam Form
        <div className="bg-white shadow-md rounded-lg overflow-visible">

          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => {
                  setQuestionmode(!questionMode);
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
                        {item.course.name} - {item.section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4"/>
                      Duration (minutes)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4"/>
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
                      <CheckCheck className="h-4 w-4"/>
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
                      <Calendar className="h-4 w-4"/>
                      Exam Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4"/>
                      Start Time
                    </span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4"/>
                      End Time
                    </span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {!questionMode && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Question Generator (AI)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload PDF
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoading(true);
                              setError("");
                              const result = await uploadFileToS3(file);
                              setPdfUrl(result.url);
                            } catch (err: any) {
                              setError("Failed to upload PDF. Please try again.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
                      />

                      {pdfUrl && (
                        <div className="mt-2 text-xs text-green-700 break-all">
                          Uploaded: <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                                       className="underline">{pdfUrl}</a>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Questions (Long Answer)
                      </label>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={extractQuestions}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader size="small"/> : "Extract Long Answer Questions from PDF"}
                  </button>
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
                            <X className="h-5 w-5"/>
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
                            <label className="block text-sm font-medium text-gray-700">Options:</label>
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
                                  <X className="h-5 w-5"/>
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <PlusCircle className="h-4 w-4 mr-2"/> Add Option
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
                        onClick={() => setQuestions(questions.map(q => ({...q, isSelected: true})))}
                      >
                        Select All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className={`p-4 transition-colors border-b border-gray-200 last:border-b-0 ${q.isSelected ? "bg-purple-50" : "hover:bg-gray-50"}`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.isSelected}
                            onChange={() => toggleQuestionSelection(index)}
                            className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <div>
                            <p className="font-medium text-gray-800">Q{index + 1}: {q.question}</p>
                            <p
                              className="text-sm text-gray-500 italic">Type: {q.questionType.replace('_', ' ')}</p> {/* Display type */}

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
                            <div className="text-sm text-gray-600 mt-1 pl-4">
                              <span className="font-medium">Answer: </span>
                              {q.answer ? (
                                Array.isArray(q.answer) ? (
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {q.answer.map((ans, i) => (
                                      <li key={i}>{ans}</li>
                                    ))}
                                  </ul>
                                ) : typeof q.answer === "string" ? (
                                  <p className="pl-2 border-l-2 border-gray-300 mt-1">{q.answer}</p>
                                ) : (
                                  <span className="italic">No answer available</span>
                                )
                              ) : (
                                <span className="italic">No answer available</span>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={questionMode ? handleCreateExam : handleCreateAiExam}
              disabled={loading}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader size="small"/> : "Create Exam"}
            </button>
          </div>
        </div>
      ) : (
        // Exam List
        <div>
          {loadingExams ? (
            <div className="flex items-center justify-center h-64">
              <Loader size="large" message="Loading exams..."/>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
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
                        <GraduationCap className="h-5 w-5 mr-2 text-gray-500"/>
                        <span>
                          {exam.classSection.batch.name} | {exam.classSection.semester.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1 text-gray-500"/>
                          <span>{exam.durationMinutes} minutes</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-1 text-gray-500"/>
                          <span>{exam.questions.length} questions</span>
                        </div>

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
                          <Calendar className="h-4 w-4 mr-1 text-gray-500"/>
                          <span>{format(new Date(exam.examDate), "PPP")}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1 text-gray-500"/>
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
                        onClick={() => fetchExamDetails(exam.id)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      {/* <button className="px-3 py-1 bg-purple-100 border border-purple-200 rounded text-purple-700 text-sm hover:bg-purple-200 transition-colors">
                        Manage
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{selectedExam.title}</h2>
              <button
                onClick={closeExamDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6"/>
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <GraduationCap className="h-5 w-5 mr-2 text-gray-500"/>
                    <span>
                      {selectedExam.classSection.batch.name} | {selectedExam.classSection.semester.name}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500"/>
                    <span>{format(new Date(selectedExam.examDate), "PPP")}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-500"/>
                    <span>
                      {format(new Date(selectedExam.startTime), "p")} - {format(new Date(selectedExam.endTime), "p")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1 text-gray-500"/>
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
                  <Loader size="medium" message="Loading exam details..."/>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Exam Questions
                    ({selectedExam.questions.length})</h3>

                  {selectedExam.questions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                          <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                          {question.correctAnswer.length === 1 ? (
                            <p className="text-sm text-gray-800">{question.correctAnswer[0]}</p>
                          ) : (
                            <ul className="space-y-1 ml-5 list-disc">
                              {question.correctAnswer.map((answer, i) => (
                                <li key={i} className="text-sm text-gray-800">{answer}</li>
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