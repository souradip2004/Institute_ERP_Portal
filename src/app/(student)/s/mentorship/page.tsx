"use client"

import { useState } from "react"
import { MessageCircle, Mic, Send, Maximize2 } from "lucide-react"
import "./mentorship.css" // Assuming you have a CSS file for styling
const Mentorship = () => {
  const [activeTab, setActiveTab] = useState("Week")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi, I am your AI Mentor." },
  ])
  const timeTabs = ["Week", "Month", "All Time"]

  const progressData = {
    completion: 70,
    subjects: [
      { name: "Mathematics", status: "Strongest", score: 85 },
      { name: "Chemistry", status: "Needs Work", score: 68 },
    ],
    subjectPerformance: [
      { name: "Mathematics", type: "Performance", score: 46, color: "blue" },
      { name: "Science", type: "Performance", score: 46, color: "purple" },
      { name: "Language Arts", type: "Completion", score: 46, color: "red" },
    ],
  }

  const chatMessages = [
    { id: 1, sender: "ai", text: "Hi, I am your ChatBot Mentor." },
    { id: 2, sender: "user", text: "I need your assistance..." },
  ]

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
      setChatHistory([...newHistory, { role: "assistant", content: data.reply }])
    } catch (err) {
      console.error("Chat error:", err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="mentorship-container">
      <div className="progress-section">
        <div className="section-header">
          <h2>
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
              <span className="progress-dot"></span>
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
                    backgroundColor:
                      subject.color === "blue" ? "#e6f0ff" : subject.color === "purple" ? "#f0e6ff" : "#ffe6e6",
                  }}
                >
                  {subject.name === "Mathematics" && "🧮"}
                  {subject.name === "Science" && "🔬"}
                  {subject.name === "Language Arts" && "📚"}
                </div>
                <h4>{subject.name}</h4>
                <div className="performance-meta">
                  <span>{subject.type}</span>
                  <span
                    className="performance-score"
                    style={{
                      color: subject.color === "blue" ? "#4070f4" : subject.color === "purple" ? "#a64bf4" : "#f44b4b",
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
                      backgroundColor:
                        subject.color === "blue" ? "#4070f4" : subject.color === "purple" ? "#a64bf4" : "#f44b4b",
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
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === "assistant" ? "ai-message" : "user-message"}`}>
              <div className="message-bubble">{msg.content}</div>
            </div>
          ))}
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