"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Mic, Send, Maximize2 } from "lucide-react"
import "./mentorship.css" // Assuming you have a CSS file for styling

const Mentorship = () => {
  const [activeTab, setActiveTab] = useState("Week")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi, I am your AI Mentor." },
  ])
  const timeTabs = ["Week", "Month", "All Time"]

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

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newHistory = [...chatHistory, { role: "user", content: message }]
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
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

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
              className={`time-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="progress-overview">
          <h3>Progress Overview</h3>

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
              <span className="progress-dot" style={{ backgroundColor: '#4070f4' }}></span> {/* Use a consistent color */}
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

      <div className="chat-section">
        <div className="chat-header">
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
      </div>
    </div>
  )
}

export default Mentorship