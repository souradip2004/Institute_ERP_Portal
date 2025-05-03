"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { forceLogout as logoutAndRedirect } from "@/lib/logout-utils";

interface Question {
  question: string;
  answer: string | string[] | null;
  isSelected: boolean;
}

interface ClassSection {
  id: string;
  sectionName: string;
  batchId: string;
  semesterId: string;
  teacherId?: string;
  maxStudents?: number;
  batch: {
    id: string;
    name: string;
  };
  semester: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
}

export default function CreateExam() {
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(2);

  // New states for additional exam fields
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [selectedClassSectionId, setSelectedClassSectionId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("60");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [passingMarks, setPassingMarks] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Function to scroll to the PDF URL input field
  const scrollToQuestionGenerator = () => {
    const pdfUrlSection = document.getElementById('pdfUrlSection');
    if (pdfUrlSection) {
      // Ensure the element is properly scrolled into view with better positioning
      pdfUrlSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Try to focus the input inside this section after scrolling
      setTimeout(() => {
        const pdfUrlInput = document.getElementById('pdfUrlInput');
        if (pdfUrlInput) {
          pdfUrlInput.focus();
        }
      }, 300);
    } else {
      console.error("PDF URL section element not found");
    }
  };

  // Helper function to generate display name for class sections
  const getClassSectionDisplayName = (section: ClassSection) => {
    let displayName = "";

    if (section.course?.name) {
      displayName += `${section.course.name} (${section.course.code}) - `;
    }

    if (section.sectionName) {
      displayName += `Section ${section.sectionName}`;
    }

    if (section.batch?.name) {
      displayName += ` - ${section.batch.name}`;
    }

    if (section.semester?.name) {
      displayName += ` - ${section.semester.name}`;
    }

    return displayName || "Unknown Section";
  };

  // Force logout and redirect to login
  const forceLogout = () => {
    const errorMessage = 'Your session was invalid. Please log in again.';
    logoutAndRedirect(errorMessage);
  };

  useEffect(() => {
    // Check authentication on page load and redirect if needed
    const checkAuth = async () => {
      setLoadingAuth(true);
      try {
        // First try to get user data from localStorage
        const storedUser = localStorage.getItem('user');
        let userData = null;

        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
            console.log("Found stored user data:", userData);

            // If we have valid teacher data in localStorage, we can proceed
            if (userData?.role === 'TEACHER') {
              console.log("User is authenticated as a teacher based on localStorage");
              // Still fetch class sections even if we're authenticated from localStorage
              fetchClassSections();
            }
          } catch (e) {
            console.error("Error parsing stored user data:", e);
          }
        }

        const authResponse = await axios.get('/api/auth/session', {
          withCredentials: true
        });

        console.log('Auth status:', authResponse.data);

        // If not logged in, redirect to login
        if (!authResponse.data || !authResponse.data.user) {
          setError("You must be logged in as a teacher to create exams");
          forceLogout();
          return;
        }

        // If not a teacher, show error
        if (authResponse.data.user.role !== 'TEACHER') {
          setError("Only teachers can create exams");
          forceLogout();
          return;
        }

        // Update localStorage with current user data
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));

        // Get teacher details
        try {
          const teacherResponse = await axios.get('/api/teacher/profile', {
            withCredentials: true
          });
          console.log('Teacher profile:', teacherResponse.data);

          if (teacherResponse.data.success) {
            setCurrentTeacher(teacherResponse.data.teacher);

            // Verify the user ID matches the teacher's user ID
            if (teacherResponse.data.teacher.userId !== authResponse.data.user.id) {
              console.error('User ID mismatch!', {
                sessionUserId: authResponse.data.user.id,
                teacherUserId: teacherResponse.data.teacher.userId
              });
              setError("Session user ID doesn't match teacher's user ID. Please log in again.");
              forceLogout();
              return;
            }
          } else {
            setError("Failed to load teacher profile");
            forceLogout();
            return;
          }
        } catch (err) {
          console.error('Failed to fetch teacher profile:', err);
          setError("Failed to fetch teacher profile. Please log in again.");
          forceLogout();
          return;
        }

        // If we're authenticated, fetch class sections regardless of the method
        fetchClassSections();
      } catch (err) {
        console.error('Auth check failed:', err);
        setError("Authentication check failed. Please try logging in again.");
        forceLogout();
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const fetchClassSections = async () => {
    try {
      console.log("Fetching class sections...");
      const response = await axios.get("/api/teacher/class-sections", {
        withCredentials: true,
      });

      console.log('Class sections response:', response.data);

      if (response.data.classSections && response.data.classSections.length > 0) {
        setClassSections(response.data.classSections);
        setSelectedClassSectionId(response.data.classSections[0].id);
        console.log("Class sections loaded successfully:", response.data.classSections.length);
      } else {
        console.warn("No class sections found");
        setError("No class sections found that you can create exams for. Please contact the administrator.");
      }
    } catch (err: any) {
      console.error("Error fetching class sections:", err);
      const errorMsg = err.response?.data?.error || "Failed to fetch class sections";
      setError(errorMsg + ". Please ensure you have access to class sections as a teacher.");
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
        numQuestions
      }, {
        withCredentials: true
      });

      if (response.data.questions) {
        setQuestions(
          response.data.questions.map((q: Question) => ({
            ...q,
            isSelected: false,
          }))
        );
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
    const selectedQuestions = questions
      .filter((q) => q.isSelected)
      .map(({ question, answer }) => ({ question, answer }));

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question");
      return;
    }

    if (!examTitle.trim()) {
      setError("Please enter an exam title");
      return;
    }

    if (!selectedClassSectionId) {
      setError("Please select a class section");
      return;
    }

    try {
      setLoading(true);

      // First confirm this teacher has permission for this class section
      try {
        const sectionCheckResponse = await axios.get(`/api/teacher/class-sections/${selectedClassSectionId}/check-permission`, {
          withCredentials: true
        });

        if (!sectionCheckResponse.data.hasPermission) {
          setError(`You don't have permission to create exams for this class section (${selectedClassSectionId})`);
          setLoading(false);
          return;
        }
      } catch (permErr) {
        console.error("Permission check failed:", permErr);
        setError("Failed to verify permissions for this class section. Please try another section.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "/api/exam/create",
        {
          title: examTitle,
          questions: selectedQuestions,
          classSectionId: selectedClassSectionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert("Exam created successfully!");
        // Reset form
        setExamTitle("");
        setQuestions([]);
        setPdfUrl("");
        setError("");
      }
    } catch (err: any) {
      console.error("Error creating exam:", err);

      // Log detailed error information
      if (err.response) {
        console.log("Error response details:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      }

      // Set appropriate error message
      if (err.response?.status === 401) {
        setError("You need to be logged in to create exams. Please log in and try again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create exams for this class. Please try another class section.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create exam. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (index: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === index ? { ...q, isSelected: !q.isSelected } : q
      )
    );
  };

  useEffect(() => {
    // After fetching class sections, log them to see their structure
    if (classSections.length > 0) {
      console.log('Class sections data structure:', classSections[0]);
    }
  }, [classSections]);

  return (
    <div className="min-h-screen w-full overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create Exam</h1>

        {loadingAuth && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying teacher session...</span>
          </div>
        )}

        {currentTeacher && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <h2 className="text-lg font-medium text-blue-800">Logged in as:</h2>
            <div className="mt-2">
              <p><span className="font-semibold">Teacher:</span> {currentTeacher.user?.name || 'Unknown'}</p>
              <p><span className="font-semibold">ID:</span> {currentTeacher.id}</p>
              <p><span className="font-semibold">User ID:</span> {currentTeacher.userId}</p>
              <p><span className="font-semibold">Department:</span> {currentTeacher.department?.name || 'Unknown'}</p>
            </div>
            <button
              onClick={forceLogout}
              className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              Not you? Log out and switch accounts
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex flex-col">
              <p>{error}</p>
              {(error.includes("logged in") || error.includes("login") || error.includes("authentication")) && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="mt-2 self-start px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Exam Title
          </label>
          <input
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter exam title"
          />
        </div>

        <div className="mb-4" id="pdfUrlSection">
          <label htmlFor="pdfUrlInput" className="block text-gray-700 text-sm font-medium mb-2">
            PDF Filename or URL
          </label>
          <div className="flex space-x-2">
            <input
              id="pdfUrlInput"
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter PDF filename or URL"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              onClick={scrollToQuestionGenerator}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Back to PDF Input
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Number of Questions
          </label>
          <input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <button
            onClick={extractQuestions}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? "Extracting..." : "Extract Questions"}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Questions</h2>
            <div className="space-y-2">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded ${q.isSelected ? "border-blue-500 bg-blue-50" : ""
                    }`}
                >
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={q.isSelected}
                      onChange={() => toggleQuestionSelection(index)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{q.question}</p>
                      <p className="text-sm text-gray-600">
                        Answer:{" "}
                        {Array.isArray(q.answer)
                          ? q.answer.join(", ")
                          : q.answer || "N/A"}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="classSectionId" className="block text-gray-700 text-sm font-medium mb-2">
            Class Section
          </label>
          <select
            id="classSectionId"
            name="classSectionId"
            className="w-full px-3 py-2 border rounded-md"
            value={selectedClassSectionId}
            onChange={(e) => setSelectedClassSectionId(e.target.value)}
            required
          >
            <option value="">Select class section</option>
            {classSections.length > 0 ? (
              classSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {getClassSectionDisplayName(section)}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading class sections...</option>
            )}
          </select>
          {classSections.length === 0 && !loadingAuth && (
            <p className="text-sm text-red-500 mt-1">
              No class sections available. Please check your permissions.
            </p>
          )}
        </div>

        {/* For debugging in development - Always show this during development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 p-2 border rounded">
            <summary className="text-sm text-gray-600 cursor-pointer">Debug: Class Section Data</summary>
            <div className="mt-2 text-xs">
              <p>Total sections: {classSections.length}</p>
              <p>Selected section ID: {selectedClassSectionId || 'none'}</p>
              <p>Loading auth: {loadingAuth ? 'true' : 'false'}</p>
              <button
                onClick={fetchClassSections}
                className="px-2 py-1 bg-gray-200 rounded text-xs mt-1"
              >
                Retry Fetch
              </button>
            </div>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(classSections, null, 2)}
            </pre>
          </details>
        )}

        <div className="flex space-x-2 mb-20">
          <button
            onClick={handleCreateExam}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}