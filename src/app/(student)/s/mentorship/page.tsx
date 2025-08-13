"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  MessageCircle,
  Mic,
  Send,
  Download,
  RefreshCw,
  User,
  Brain,
  SquareDashedKanban,
  NotebookPen,
  PieChart,
  ClipboardList,
  Plus,
} from "lucide-react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import React from "react"

// Please note: In a production environment,
// these keys should be stored securely in environment variables.
const SPEECH_KEY = "6zQzqxHdwbLPgH305XlO9WwdUCwAi7vKCmO3Iey4ns86u0cKi6gQJQQJ99BFACYeBjFXJ3w3AAAYACOGNXmu"
const SPEECH_REGION = "eastus"

const formatChatHistoryForDownload = (history) => {
  return history
    .filter((msg) => msg.role !== "system")
    .map((msg) => `${msg.role === "user" ? "You" : "AI Mentor"}: ${msg.content}`)
    .join("\n\n")
}

const Mentorship = () => {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [micActive, setMicActive] = useState(false)
  const [input, setInput] = useState("")
  const [user, setUser] = useState(null)
  const recognizerRef = useRef(null)
  const autoSendTimeoutRef = useRef(null)

  const chatMessagesRef = useRef(null)

  const getInitialChatHistory = () => {
    return [{ role: "assistant", content: "Hi, I am your AI Mentor." }]
  }

  useEffect(() => {
    setChatHistory(getInitialChatHistory())
  }, [])

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatHistory, loading])

  useEffect(() => {
    const fetchStudentResults = async () => {
      if (localStorage.getItem("user")) {
        const userData = JSON.parse(localStorage.getItem("user"))
        setUser(userData)
        if (userData.studentId) {
          try {
            const result = await fetch(`/api/exam-submissions/student/${userData.studentId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (result.ok) {
              const resultData = await result.json()

              const gradeFromMarks = (marks) => {
                if (marks >= 90) return "A+"
                if (marks >= 80) return "A"
                if (marks >= 70) return "B"
                if (marks >= 60) return "C"
                if (marks >= 50) return "D"
                return "F"
              }

              const transformedResults = resultData.map((entry) => {
                const title = entry.exam.title
                const total = entry.exam.totalMarks
                const obtained = entry.obtainedMarks
                const grade = gradeFromMarks((obtained / total) * 100)
                const feedback = entry.feedback
                return [title, total, obtained, grade, feedback]
              })
              setResults(transformedResults)

              setChatHistory((prevHistory) => {
                const systemMessageContent = `You are a live mentor for a student named ${
                  userData.name || "Student"
                } whose marks in exams are ${JSON.stringify(transformedResults)}`
                const isSystemMessagePresent = prevHistory.some(
                  (msg) => msg.role === "system" && msg.content.startsWith("You are a live mentor")
                )
                if (!isSystemMessagePresent) {
                  return [{ role: "system", content: systemMessageContent }, ...prevHistory]
                }
                return prevHistory.map((msg) =>
                  msg.role === "system"
                    ? { ...msg, content: systemMessageContent }
                    : msg
                )
              })
            }
          } catch (error) {
            console.error("Failed to fetch student exam results:", error)
          }
        }
      }
    }

    fetchStudentResults()
  }, [])

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

    const subjectScores = {}
    results.forEach(([title, total, obtained]) => {
      if (!subjectScores[title]) subjectScores[title] = { total: 0, count: 0, obtained: 0 }
      subjectScores[title].total += Number(total)
      subjectScores[title].obtained += Number(obtained)
      subjectScores[title].count += 1
    })

    const subjectAverages = Object.entries(subjectScores).map(([name, { total, obtained }]) => ({
      name,
      avg: total ? Math.round((obtained / total) * 100) : 0,
    }))

    const sorted = [...subjectAverages].sort((a, b) => b.avg - a.avg)

    const totalObtained = results.reduce((sum, [, , obtained]) => sum + Number(obtained), 0)
    const totalPossible = results.reduce((sum, [, total]) => sum + Number(total), 0)
    const completion = totalPossible ? Math.round((totalObtained / totalPossible) * 100) : 0

    const strongest = sorted[0] || { name: "N/A", avg: 0 }
    const needsWork = sorted[sorted.length - 1] || { name: "N/A", avg: 0 }

    return {
      completion,
      subjects: [
        { name: strongest.name, status: "Strongest", score: strongest.avg },
        { name: needsWork.name, status: "Needs Work", score: needsWork.avg },
      ],
      subjectPerformance: sorted,
    }
  })()

  const startAzureMic = useCallback(() => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION)
    speechConfig.speechRecognitionLanguage = "en-IN"

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)

    recognizer.recognizing = (_, e) => {
      setInput(e.result.text)
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
        autoSendTimeoutRef.current = null
      }
    }

    recognizer.recognized = (_, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const finalText = e.result.text.trim()
        setMessage(finalText)
        if (finalText) {
          autoSendTimeoutRef.current = setTimeout(() => {
            handleSendMessage()
            setInput("")
            autoSendTimeoutRef.current = null
            setMicActive(false)
          }, 1000)
        }
      }
    }

    recognizer.canceled = (_, e) => {
      console.error("Recognition canceled:", e)
      recognizer.stopContinuousRecognitionAsync()
      setMicActive(false)
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
        autoSendTimeoutRef.current = null
      }
    }

    recognizer.sessionStopped = () => {
      recognizer.stopContinuousRecognitionAsync()
      setMicActive(false)
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
        autoSendTimeoutRef.current = null
      }
    }

    recognizer.startContinuousRecognitionAsync()
    recognizerRef.current = recognizer
  }, [])

  const stopAzureMic = useCallback(() => {
    recognizerRef.current?.stopContinuousRecognitionAsync(() => {
      recognizerRef.current?.close()
      recognizerRef.current = null
    })
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current)
      autoSendTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (micActive) startAzureMic()
    else stopAzureMic()
    return stopAzureMic
  }, [micActive, startAzureMic, stopAzureMic])

  const handleRefresh = () => {
    setChatHistory(getInitialChatHistory())
  }

  const handleSendMessage = async (text) => {
    const msgToSend = typeof text === "string" ? text : message
    if (!msgToSend.trim()) return
    const newHistory = [...chatHistory, { role: "user", content: msgToSend }]
    setChatHistory(newHistory)
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      })
      const data = await res.json()
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      console.error("Chat error:", err)
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadChat = () => {
    const chatContent = formatChatHistoryForDownload(chatHistory)
    const blob = new Blob([chatContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-mentor-chat-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const chatInputArea = (
    <div className="flex w-full items-center justify-between gap-2 rounded-2xl border bg-white p-2 md:gap-4 md:p-4">
      <button
        className={`rounded-xl p-2 text-gray-500 hover:bg-gray-100 md:p-3 ${
          micActive ? "text-indigo-600 animate-pulse" : ""
        }`}
        onClick={() => setMicActive((prev) => !prev)}
        title={micActive ? "Stop Recording" : "Start Recording"}
      >
        <Mic size={22} />
      </button>
      <input
        type="text"
        placeholder={micActive ? "Listening..." : "Message AI Mentor..."}
        className="flex-1 resize-none overflow-hidden rounded-2xl bg-transparent px-2 py-1 text-base focus:outline-none placeholder:text-gray-400 md:text-lg"
        value={micActive ? input : message}
        onChange={(e) => {
          if (micActive) setMessage(e.target.value)
          else setMessage(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (micActive) handleSendMessage()
            else handleSendMessage()
          }
        }}
        disabled={loading}
      />
      <button
        className={`rounded-xl p-2 md:p-3 ${
          loading || (!micActive && !message.trim())
            ? "text-gray-400"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
        onClick={() => (micActive ? handleSendMessage() : handleSendMessage())}
        disabled={loading || (!micActive && !message.trim())}
      >
        <Send size={22} />
      </button>
    </div>
  )

  const isInitialState = chatHistory.filter((msg) => msg.role !== "system").length <= 1

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900">
      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex w-full items-center justify-between border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-indigo-500" />
            <h1 className="text-xl font-bold">AI Mentor</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadChat}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              title="Download Chat"
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleRefresh}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              title="New/Clear Chat"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {isInitialState ? (
          /* Initial State UI (like a landing page) */
          <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
            <h1 className="mb-2 text-3xl font-extrabold text-gray-800 md:text-5xl">
              Hello {user?.name || "Student"}!
            </h1>
            <p className="mb-10 text-base text-gray-600 md:text-lg">
              How can I help you today?
            </p>

            <div className="w-full max-w-5xl">
              <h2 className="mb-4 text-xl font-bold text-gray-700 md:text-2xl">
                Your Learning Snapshot
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Overall Progress Card */}
                <div className="flex items-center rounded-xl bg-white p-6 shadow-lg">
                  <div className="relative mr-6 h-20 w-20">
                    <svg viewBox="0 0 36 36" className="absolute top-0 left-0">
                      <path
                        className="text-gray-200"
                        fill="none"
                        strokeWidth="3.8"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        fill="none"
                        strokeWidth="3.8"
                        strokeDasharray={`${progressData.completion}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center font-bold">
                      <span className="text-2xl text-gray-800">
                        {progressData.completion}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Overall Progress
                    </h3>
                    <p className="text-sm text-gray-500">
                      You've completed {progressData.completion}% of your exams.
                    </p>
                  </div>
                </div>
                {/* Subject Highlights Card */}
                <div className="flex flex-col justify-center space-y-4 rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
                      <PieChart size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">
                        Strongest Topic
                      </h4>
                      <p className="text-lg font-bold text-gray-800">
                        {progressData.subjects[0].name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-red-100 p-3 text-red-600">
                      <SquareDashedKanban size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">
                        Needs Work
                      </h4>
                      <p className="text-lg font-bold text-gray-800">
                        {progressData.subjects[1].name}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Subject Performance Card */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                      <ClipboardList size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Topic Wise Averages
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {progressData.subjectPerformance.map((subject, index) => (
                      <div key={index}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {subject.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {subject.avg}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2.5 rounded-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${subject.avg}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 w-full max-w-3xl">
              <p className="mb-6 text-lg font-semibold text-gray-700">
                You can ask me to...
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => handleSendMessage("Explain a complex topic to me.")}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
                >
                  <Brain size={24} />
                  <span className="mt-1">Explain a topic</span>
                </button>
                <button
                  onClick={() => handleSendMessage("Give me a personalized study plan.")}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
                >
                  <NotebookPen size={24} />
                  <span className="mt-1">Give me a study plan</span>
                </button>
                <button
                  onClick={() => handleSendMessage("Analyze my performance and give me feedback.")}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
                >
                  <ClipboardList size={24} />
                  <span className="mt-1">Analyze my performance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Full Chat View */
          <div
            ref={chatMessagesRef}
            className="flex-1 overflow-y-auto p-4 md:p-8"
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              {chatHistory.map((msg, i) => {
                if (msg.role === "system") return null
                const isUser = msg.role === "user"
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Brain size={20} />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-base leading-relaxed shadow-md ${
                        isUser
                          ? "rounded-tr-none bg-indigo-600 text-white"
                          : "rounded-tl-none bg-white text-gray-800"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    {isUser && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                )
              })}
              {loading && (
                <div className="flex items-start justify-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Brain size={20} />
                  </div>
                  <div className="max-w-2xl rounded-2xl rounded-tl-none bg-white p-4 shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500"></div>
                      <div className="h-2 w-2 animate-pulse-slow rounded-full bg-gray-500"></div>
                      <div className="h-2 w-2 animate-pulse-fast rounded-full bg-gray-500"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-4xl p-4">
          {chatInputArea}
        </div>
      </main>
    </div>
  )
}

export default Mentorship