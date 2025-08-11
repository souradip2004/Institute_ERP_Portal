"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Mic, Send, Download, RefreshCw } from "lucide-react";
import "./mentorship.css" // Assuming you have a CSS file for styling
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import React from "react";


const Mentorship = () => {

  const SPEECH_KEY = "6zQzqxHdwbLPgH305XlO9WwdUCwAi7vKCmO3Iey4ns86u0cKi6gQJQQJ99BFACYeBjFXJ3w3AAAYACOGNXmu";      // or a hard-coded test key
  const SPEECH_REGION = "eastus"; // e.g. "eastus"

  const [activeTab, setActiveTab] = useState("Week")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi, I am your AI Mentor." },
  ])
  const [micActive, setMicActive] = useState(false);
  const [input, setInput] = useState("");
  const recognizerRef = React.useRef(null);
  const autoSendTimeoutRef = React.useRef(null);
  const timeTabs = []

  useEffect(() => {
    const fetchStudentResults = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"))
        if (user.studentId) {
          try {
            const result = await fetch(`/api/exam-submissions/student/${user.studentId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (result.ok) {
              const resultData = await result.json()

              const gradeFromMarks = (marks: number): string => {
                if (marks >= 90) return 'A+'
                if (marks >= 80) return 'A'
                if (marks >= 70) return 'B'
                if (marks >= 60) return 'C'
                if (marks >= 50) return 'D'
                return 'F'
              }

              const transformedResults = resultData.map((entry: any) => {
                const title = entry.exam.title
                const total = entry.exam.totalMarks
                const obtained = entry.obtainedMarks
                const grade = gradeFromMarks(obtained)
                const feedback = entry.feedback
                return [title, total, obtained, grade, feedback]
              })
              setResults(transformedResults)

              // Update chat history with system message only if not already present or data changes
              setChatHistory((prevHistory) => {
                const systemMessageContent = `You are a live mentor for a student whose marks in exams are ${JSON.stringify(transformedResults)}`
                const isSystemMessagePresent = prevHistory.some(
                  (msg) => msg.role === "system" && msg.content === systemMessageContent
                )
                if (!isSystemMessagePresent) {
                  return [...prevHistory, { role: "system", content: systemMessageContent }]
                }
                return prevHistory
              })
            }
          } catch (error) {
            console.error("Failed to fetch student exam results:", error)
          }
        }
      }
    }

    fetchStudentResults()
  }, []) // Empty dependency array to run only once on mount

  // Compute progressData from results
  const progressData = (() => {
    if (!results || results.length === 0) {
      return {
        completion: 0,
        subjects: [
          { name: "N/A", status: "Strongest", score: 0 },
          { name: "N/A", status: "Needs Work", score: 0 },
        ],
        subjectPerformance: [],
      }
    }

    // Aggregate scores by subject
    const subjectScores: Record<string, { total: number; count: number }> = {}
    results.forEach(([title, total, obtained]) => {
      if (!subjectScores[title]) subjectScores[title] = { total: 0, count: 0 }
      subjectScores[title].total += Number(obtained)
      subjectScores[title].count += 1
    })

    // Calculate average for each subject
    const subjectAverages = Object.entries(subjectScores).map(([name, { total, count }]) => ({
      name,
      avg: Math.round(total / count),
    }))

    // Sort by average descending
    const sorted = [...subjectAverages].sort((a, b) => b.avg - a.avg)

    // Completion as average of all obtained/total
    const totalObtained = results.reduce((sum, [, , obtained]) => sum + Number(obtained), 0)
    const totalPossible = results.reduce((sum, [, total]) => sum + Number(total), 0)
    const completion = totalPossible ? Math.round((totalObtained / totalPossible) * 100) : 0

    // Subject highlights
    const strongest = sorted[0] || { name: "N/A", avg: 0 }
    const needsWork = sorted[sorted.length - 1] || { name: "N/A", avg: 0 }

    // Subject performance cards (limit to 3, assign colors)
    const colors = ["#4070f4", "#a64bf4", "#f44b4b"] // Directly using hex codes for consistency
    const backgroundColors = ["#e6f0ff", "#f0e6ff", "#ffe6e6"]

    const subjectPerformance = sorted.slice(0, 3).map((s, i) => ({
      name: s.name,
      type: "Performance",
      score: s.avg,
      color: colors[i] || colors[0], // Default to first color if out of bounds
      backgroundColor: backgroundColors[i] || backgroundColors[0],
    }))

    return {
      completion,
      subjects: [
        { name: strongest.name, status: "Strongest", score: strongest.avg },
        { name: needsWork.name, status: "Needs Work", score: needsWork.avg },
      ],
      subjectPerformance,
    }
  })()


  /* ───── 3. Azure Speech Recognition logic ───────────────────────────── */
  const startAzureMic = () => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      SPEECH_KEY!,
      SPEECH_REGION!
    );
    speechConfig.speechRecognitionLanguage = "en-IN";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (_, e) => {
      setInput(e.result.text);
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = null;
      }
    };

    recognizer.recognized = (_, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const finalText = e.result.text.trim();
        setInput(finalText);
        if (finalText) {
          autoSendTimeoutRef.current = setTimeout(() => {
            handleSendMessage(finalText);
            setInput("");
            autoSendTimeoutRef.current = null;
            setMicActive(false);
          }, 1000); // 1 second delay
        }
      }
    };

    recognizer.canceled = (_, e) => {
      console.error("Recognition canceled:", e);
      recognizer.stopContinuousRecognitionAsync();
      setMicActive(false);
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = null;
      }
    };

    recognizer.sessionStopped = () => {
      recognizer.stopContinuousRecognitionAsync();
      setMicActive(false);
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = null;
      }
    };

    recognizer.startContinuousRecognitionAsync();
    recognizerRef.current = recognizer;
  };

  const handleRefresh = () => {
    setChatHistory([{ role: "assistant", content: "Hi, I am your AI Mentor." }]);
  };

  const stopAzureMic = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync(() => {
      recognizerRef.current?.close();
      recognizerRef.current = null;
    });
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (micActive) startAzureMic();
    else stopAzureMic();
    return stopAzureMic;
  }, [micActive]);




  const handleSendMessage = async (text) => {
    const msgToSend = typeof text === "string" ? text : message;
    if (!msgToSend.trim()) return;
    const newHistory = [...chatHistory, { role: "user", content: msgToSend }];
    setChatHistory(newHistory);
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentorship-container">
      <div className="progress-section">
        <div className="section-header">
          <h2 className={"mt-11 sm:mt-0"}>
            <span className="chart-icon">📊</span>
            Your Learning Progress
          </h2>
        </div>

        <div className="time-tabs">
          {timeTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 ${activeTab === tab
                ? 'bg-gray-900 text-white shadow'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="progress-overview">
          <h3 className={"border-t pt-3"}>Progress Overview</h3>

          <div className="progress-circle-container">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36">
                <path
                  className="progress-circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="progress-circle-fill"
                  strokeDasharray={`${progressData.completion}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="progress-percentage">
                <span>{progressData.completion}%</span>
              </div>
            </div>
            <div className="progress-label">
              <span className="progress-dot" style={{ backgroundColor: '#4070f4' }}></span>
              <span>Completed {progressData.completion}%</span>
            </div>
          </div>
        </div>

        <div className="subject-highlights">
          <h3>Subject Highlights</h3>

          <div className="subject-cards">
            <div className="subject-card strongest">
              <div className="subject-status">
                <span className="status-icon">🏆</span>
                <span>Strongest</span>
              </div>
              <h4>{progressData.subjects[0].name}</h4>
              <p>{progressData.subjects[0].score}% average</p>
            </div>

            <div className="subject-card needs-work">
              <div className="subject-status">
                <span className="status-icon">⚠️</span>
                <span>Needs Work</span>
              </div>
              <h4>{progressData.subjects[1].name}</h4>
              <p>{progressData.subjects[1].score}% average</p>
            </div>
          </div>
        </div>

        <div className="subject-performance">
          <h3>Subject-Wise Performance</h3>

          <div className="performance-cards">
            {progressData.subjectPerformance.map((subject, index) => (
              <div key={index} className="performance-card">
                <div
                  className="subject-icon"
                  style={{
                    backgroundColor: subject.backgroundColor,
                  }}
                >
                  {subject.name.toLowerCase().includes("math") && "🧮"}
                  {subject.name.toLowerCase().includes("science") && "🔬"}
                  {subject.name.toLowerCase().includes("language") && "📚"}
                  {/* Add more conditions for other subjects or a default */}
                  {!subject.name.toLowerCase().includes("math") &&
                    !subject.name.toLowerCase().includes("science") &&
                    !subject.name.toLowerCase().includes("language") && "📝"} {/* Default icon */}
                </div>
                <h4>{subject.name}</h4>
                <div className="performance-meta">
                  <span>{subject.type}</span>
                  <span
                    className="performance-score"
                    style={{
                      color: subject.color,
                    }}
                  >
                    {subject.score}%
                  </span>
                </div>
                <div className="performance-bar">
                  <div
                    className="performance-fill"
                    style={{
                      width: `${subject.score}%`,
                      backgroundColor: subject.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*<div className="chat-section">
        <div className="chat-header bg-blue-500">
          <div className="chat-title">
            <MessageCircle size={18} />
            <h3>Ask Your AI Mentor</h3>
          </div>
          <div className="chat-actions">
            <button className="chat-action-button"><Mic size={18} /></button>
            <button className="chat-action-button"><Maximize2 size={18} /></button>
          </div>
        </div>

        <div className="chat-messages">
          {chatHistory.map((msg, i) => {
            if (msg.role === "system") return null // Don't render system messages
            return (
              <div key={i} className={`chat-message ${msg.role === "assistant" ? "ai-message" : "user-message"}`}>
                <div className="message-bubble">{msg.content}</div>
              </div>
            )
          })}
          {loading && (
            <div className="chat-message ai-message">
              <div className="message-bubble">Typing...</div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <button className="chat-tool-button"><span className="plus-icon">+</span></button>
          <input
            type="text"
            placeholder="Type your doubt"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className="send-button" onClick={handleSendMessage}><Send size={18} /></button>
        </div>
      </div>*/}

      <div className="bg-white rounded-lg border border-slate-200 flex flex-col shadow-lg">
        {/* Chat Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} />
            <h3 className="font-semibold text-lg">Ask Your AI Mentor</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
              onClick={handleRefresh}
              title="Clear Chat"
            >
              <RefreshCw size={20} />
            </button>
          
          </div>
        </div>
        {/* Chat Messages Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-100">
          {chatHistory.map((msg, i) => {
            if (msg.role === "system") return null
            const isUser = msg.role === "user"
            return (
              <div key={i} className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-md rounded-xl p-4 ${isUser ? "bg-indigo-500 text-white" : "bg-white text-slate-800 shadow-sm"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-2 ${isUser ? "text-indigo-200" : "text-slate-400"} text-right`}>
                    Just now
                  </p>
                </div>
              </div>
            )
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-md rounded-xl p-4 bg-white text-slate-800 shadow-sm">
                <p className="text-sm">Typing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {/*<div className="p-4 bg-slate-100 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
              Explain the formula
            </button>
            <button className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
              Real-world example
            </button>
            <button className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
              Summary of key points
            </button>
          </div>
        </div>*/}

        {/* Chat Input (Functionality is preserved) */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 rounded-b-lg">
          <button
            className={`bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors ${micActive ? "animate-pulse" : ""}`}
            onClick={() => setMicActive((prev) => !prev)}
            title={micActive ? "Stop Recording" : "Start Recording"}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            placeholder={micActive ? "Listening..." : "Ask your question..."}
            className="flex-1 bg-transparent focus:outline-none placeholder:text-slate-500"
            value={micActive ? input : message}
            onChange={(e) => {
              if (micActive) setInput(e.target.value);
              else setMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (micActive) handleSendMessage(input);
                else handleSendMessage();
              }
            }}
            disabled={loading}
          />
          <button
            className="text-indigo-600 p-2 rounded-full hover:bg-indigo-100 transition-colors"
            onClick={() => micActive ? handleSendMessage(input) : handleSendMessage()}
            disabled={loading}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Mentorship