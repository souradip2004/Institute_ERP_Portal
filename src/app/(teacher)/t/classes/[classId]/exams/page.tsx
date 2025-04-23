"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useParams } from 'next/navigation';
import Loader from '@/components/ui/Loader';

interface Question {
  question: string;
  answer: string | string[] | null;
  isSelected: boolean;
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
    marks: number;
  }>;
  classSection: {
    batch: {
      name: string;
    };
    semester: {
      name: string;
    };
  };
}

interface ExamsPageProps {
  params: {
    classId: string;
  };
}

export default function ExamsPage({ params }: ExamsPageProps) {
  const { classId } = params;
  
  // States for exam creation
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState<string>("2");
  
  // New states for additional exam fields
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
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

  // Fetch exams and class sections on component mount
  useEffect(() => {
    fetchExams();
    fetchClassSections();
  }, []);

  const fetchClassSections = async () => {
    try {
      const response = await axios.get("/api/teacher/class-sections", {
        withCredentials: true,
      });
      setClassSections(response.data.classSections);
      if (response.data.classSections.length > 0) {
        setSelectedClassSection(response.data.classSections[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching class sections:", err);
      setError(err.response?.data?.error || "Failed to fetch class sections");
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const response = await axios.get(`/api/exam/list?classSectionId=${classId}`, {
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
        const extractedQuestions = response.data.questions.map((q: Question) => ({
          ...q,
          isSelected: false,
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
      const response = await axios.post(
        "/api/exam/create",
        {
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
        setShowCreateForm(false);
        fetchExams();
      }
    } catch (err: any) {
      console.error("Error creating exam:", err);
      setError(err.response?.data?.error || "Failed to create exam");
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showCreateForm ? "View Exams" : "Create New Exam"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm ? (
        // Create Exam Form
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Class Section
            </label>
            <select
              value={selectedClassSection}
              onChange={(e) => setSelectedClassSection(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select Class Section</option>
              {classSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.batch.name} - {section.semester.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Passing Marks
              </label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              PDF URL
            </label>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter PDF URL"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <button
              onClick={extractQuestions}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mr-2"
            >
              {loading ? <Loader size="small" /> : "Extract Questions"}
            </button>
          </div>

          {questions.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Questions</h2>
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded ${
                      q.isSelected ? "border-blue-500 bg-blue-50" : ""
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
                          {q.answer ? (
                            Array.isArray(q.answer) ? (
                              q.answer.join(", ")
                            ) : typeof q.answer === "string" ? (
                              q.answer.split(". ").map((option, i) => (
                                <span key={i}>
                                  {option}
                                  <br />
                                </span>
                              ))
                            ) : (
                              "No answer available"
                            )
                          ) : (
                            "No answer available"
                          )}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreateExam}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? <Loader size="small" /> : "Create Exam"}
          </button>
        </div>
      ) : (
        // Exam List
        <div>
          {loadingExams ? (
            <Loader size="large" message="Loading exams..." />
          ) : exams.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No exams created yet</div>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{exam.title}</h2>
                      <p className="text-gray-600">
                        Batch: {exam.classSection.batch.name} | Semester:{" "}
                        {exam.classSection.semester.name}
                      </p>
                      <p className="text-gray-600">
                        Duration: {exam.durationMinutes} minutes | Total Marks:{" "}
                        {exam.totalMarks} | Passing Marks: {exam.passingMarks}
                      </p>
                      <p className="text-gray-600">
                        Questions: {exam.questions.length}
                      </p>
                      <p className="text-gray-600">
                        Date: {format(new Date(exam.examDate), "PPP")}
                      </p>
                      <p className="text-gray-600">
                        Time: {format(new Date(exam.startTime), "p")} -{" "}
                        {format(new Date(exam.endTime), "p")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        exam.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : exam.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
