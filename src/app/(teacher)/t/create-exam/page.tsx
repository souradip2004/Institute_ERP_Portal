"use client";
import { useState } from "react";
import axios from "axios";

interface Question {
  question: string;
  answer: string | string[] | null;
  isSelected: boolean;
}

export default function CreateExam() {
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(2);

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

    try {
      setLoading(true);
      const response = await axios.post(
        "/api/exam/create",
        {
          title: examTitle,
          questions: selectedQuestions,
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
      <h1 className="text-2xl font-bold mb-4">Create Exam</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          PDF URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter PDF URL"
          />
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

      <button
        onClick={handleCreateExam}
        disabled={loading}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Exam"}
      </button>
    </div>
  );
}
