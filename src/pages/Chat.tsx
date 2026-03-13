import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, User, Bot, Loader2, Trash2, Plus, X, Calculator, ChevronRight } from 'lucide-react'
import { MessageContent } from '../components/MessageContent'
import { type ChatMessage, getAllMessages, addMessage, clearAllMessages } from '../lib/db'
import './Chat.css'

// ── Types ─────────────────────────────────────────────────────────────────────
type ToolStep = null | 'menu' | 'subject' | 'marks'

// ── Component ─────────────────────────────────────────────────────────────────
export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Quick Entry State ──────────────────────────────────────────────────────
  const [toolStep, setToolStep] = useState<ToolStep>(null)
  const [subject, setSubject] = useState('')
  const [quizMarks, setQuizMarks] = useState(['', '', '', '', ''])
  const [assignMarks, setAssignMarks] = useState(['', ''])
  const [compreMarks, setCompreMarks] = useState('')

  // ── Load DB & settings ────────────────────────────────────────────────────
  useEffect(() => {
    const loadFromDB = async () => {
      const storedMessages = await getAllMessages()
      setMessages(storedMessages)
      setIsInitialized(true)
    }
    loadFromDB()
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isInitialized) scrollToBottom()
  }, [messages, isInitialized, scrollToBottom])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  // ── Close tools panel on Escape ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTools()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeTools = () => {
    setToolStep(null)
    setSubject('')
    setQuizMarks(['', '', '', '', ''])
    setAssignMarks(['', ''])
    setCompreMarks('')
  }

  const clearChat = async () => {
    await clearAllMessages()
    setMessages([])
  }

  // ── Core send logic ───────────────────────────────────────────────────────
  const dispatchMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    }

    await addMessage(userMessage)
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }))

      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: conversationHistory })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `API error (${response.status})`)
      const aiResponse = data.response || data.message || JSON.stringify(data)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      await addMessage(assistantMessage)
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Connection Error**\n\n${errorMsg}\n\nPlease check:\n- Your API URL is correct\n- Your API key is configured in \`.env\`\n- The API endpoint is accessible`,
        timestamp: new Date()
      }
      await addMessage(errorMessage)
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // ── Normal textarea send ──────────────────────────────────────────────────
  const sendMessage = async () => {
    await dispatchMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Quick Entry: Calculate Grade ──────────────────────────────────────────
  const handleCalculateGrade = () => {
    // Validate subject
    if (!subject.trim()) return

    // Build quiz part — only include quizzes that were filled in
    const filledQuizzes = quizMarks
      .map((v, i) => ({ idx: i + 1, val: v }))
      .filter(q => q.val.trim() !== '')

    if (filledQuizzes.length === 0) return
    if (!compreMarks.trim()) return

    const quizParts = filledQuizzes
      .map(q => `  • Quiz ${q.idx}: ${q.val}%`)
      .join('\n')

    const filledAssign = assignMarks
      .map((v, i) => ({ idx: i + 1, val: v }))
      .filter(a => a.val.trim() !== '')

    const assignParts =
      filledAssign.length > 0
        ? '\nAssignment marks:\n' + filledAssign.map(a => `  • Assignment ${a.idx}: ${a.val}%`).join('\n')
        : ''

    const prompt =
      `Calculate my grade for ${subject.trim()}:\n\n` +
      `Quiz marks:\n${quizParts}${assignParts}\n\n` +
      `Comprehensive exam: ${compreMarks} out of 50`

    closeTools()
    dispatchMessage(prompt)
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!isInitialized) {
    return (
      <div className="chat-container">
        <div className="ambient-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading chat history...</p>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="chat-container">
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>



      {/* Messages */}
      <main className="messages-container">
        <div className="messages-wrapper">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon animate-float"><Bot size={48} /></div>
              <h2>Hi, I'm Anie! 👋</h2>
              <p>Your BITS CS academic advisor. Ask me about grades, SGPA/CGPA, syllabus, or curriculum!</p>
              <div className="suggestions">
                <button onClick={() => setInput('Calculate my grade for Web Programming')}>Calculate my grade</button>
                <button onClick={() => setInput('Tell me about the CS syllabus')}>CS Syllabus</button>
                <button onClick={() => setInput('Explain the BITS curriculum structure')}>BITS Curriculum</button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`message ${message.role}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">{message.role === 'user' ? 'You' : 'Anie'}</span>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="message-body">
                      <MessageContent content={message.content} />
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant loading">
                  <div className="message-avatar"><Bot size={20} /></div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span className="animate-pulse-dot" style={{ animationDelay: '0s' }} />
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── Tool Panels ──────────────────────────────────────────────────────── */}

      {/* Backdrop */}
      {toolStep && toolStep !== 'menu' && (
        <div className="tool-backdrop" onClick={closeTools} />
      )}

      {/* STEP: tools menu (popup above + button) */}
      {toolStep === 'menu' && (
        <div className="tools-menu">
          <div className="tools-menu-header">
            <span>Tools</span>
            <button className="tools-menu-close" onClick={closeTools}><X size={14} /></button>
          </div>
          <button
            className="tools-menu-item"
            onClick={() => setToolStep('subject')}
          >
            <div className="tools-menu-item-icon"><Calculator size={18} /></div>
            <div className="tools-menu-item-text">
              <span className="tools-menu-item-title">Calculate Grade</span>
              <span className="tools-menu-item-desc">Enter marks, get instant grade</span>
            </div>
            <ChevronRight size={16} className="tools-menu-item-arrow" />
          </button>
        </div>
      )}

      {/* STEP 1: Subject name */}
      {toolStep === 'subject' && (
        <div className="tool-panel subject-panel">
          <div className="tool-panel-header">
            <div className="tool-panel-title">
              <Calculator size={18} />
              <span>Calculate Grade</span>
            </div>
            <button className="tool-panel-close" onClick={closeTools}><X size={16} /></button>
          </div>
          <div className="subject-body">
            <p className="subject-prompt">Which subject do you want to calculate?</p>
            <input
              className="subject-input"
              type="text"
              placeholder="e.g. Web Programming, DSA, OOP..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && subject.trim()) setToolStep('marks') }}
              autoFocus
            />
            <button
              className="subject-next-btn"
              disabled={!subject.trim()}
              onClick={() => setToolStep('marks')}
            >
              Enter Marks <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Marks table */}
      {toolStep === 'marks' && (
        <div className="tool-panel marks-panel">
          <div className="tool-panel-header">
            <div className="tool-panel-title">
              <Calculator size={18} />
              <span>{subject}</span>
            </div>
            <button className="tool-panel-close" onClick={closeTools}><X size={16} /></button>
          </div>

          <p className="marks-panel-subtitle">Fill in the marks below</p>

          <div className="marks-table-wrapper">
            <table className="marks-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Your Marks</th>
                  <th>Out of</th>
                </tr>
              </thead>
              <tbody>
                {/* 5 Quizzes */}
                {quizMarks.map((val, i) => (
                  <tr key={`quiz-${i}`} className="marks-row quiz-row">
                    <td className="marks-label">
                      <span className="marks-badge quiz-badge">Q{i + 1}</span>
                      Quiz {i + 1}
                    </td>
                    <td>
                      <input
                        className="marks-input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="—"
                        value={val}
                        onChange={e => {
                          const next = [...quizMarks]
                          next[i] = e.target.value
                          setQuizMarks(next)
                        }}
                      />
                    </td>
                    <td className="marks-outof">100</td>
                  </tr>
                ))}

                {/* Divider */}
                <tr className="marks-divider"><td colSpan={3}></td></tr>

                {/* 2 Assignments */}
                {assignMarks.map((val, i) => (
                  <tr key={`assign-${i}`} className="marks-row assign-row">
                    <td className="marks-label">
                      <span className="marks-badge assign-badge">A{i + 1}</span>
                      Assignment {i + 1}
                    </td>
                    <td>
                      <input
                        className="marks-input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="—"
                        value={val}
                        onChange={e => {
                          const next = [...assignMarks]
                          next[i] = e.target.value
                          setAssignMarks(next)
                        }}
                      />
                    </td>
                    <td className="marks-outof">100</td>
                  </tr>
                ))}

                {/* Divider */}
                <tr className="marks-divider"><td colSpan={3}></td></tr>

                {/* Compre */}
                <tr className="marks-row compre-row">
                  <td className="marks-label">
                    <span className="marks-badge compre-badge">C</span>
                    Compre Exam
                  </td>
                  <td>
                    <input
                      className="marks-input"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="—"
                      value={compreMarks}
                      onChange={e => setCompreMarks(e.target.value)}
                    />
                  </td>
                  <td className="marks-outof">50</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="marks-actions">
            <button className="marks-back-btn" onClick={() => setToolStep('subject')}>
              ← Back
            </button>
            <button
              className="marks-calculate-btn"
              onClick={handleCalculateGrade}
              disabled={
                isLoading ||
                quizMarks.every(v => v.trim() === '') ||
                !compreMarks.trim()
              }
            >
              {isLoading ? <Loader2 size={16} className="spin" /> : <Calculator size={16} />}
              Calculate Grade
            </button>
          </div>
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <footer className="input-container">
        <div className="input-wrapper">
          {/* + Tools button */}
          <button
            className={`plus-btn ${toolStep === 'menu' ? 'plus-btn-active' : ''}`}
            onClick={() => setToolStep(prev => prev === 'menu' ? null : 'menu')}
            title="Tools"
          >
            {toolStep === 'menu' ? <X size={18} /> : <Plus size={18} />}
          </button>

          {/* Clear chat */}
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} title="Clear chat history">
              <Trash2 size={18} />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
          </button>
        </div>
      </footer>
    </div>
  )
}
