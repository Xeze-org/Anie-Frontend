import { useState, useRef, useEffect, useCallback } from 'react'
import {
    Send, User, Bot, Loader2, Trash2, ArrowLeft,
    Plus, X, Calculator, ChevronRight
} from 'lucide-react'
import { MessageContent } from '../components/MessageContent'
import { type ChatMessage, getAllMessages, addMessage, clearAllMessages } from '../lib/db'
import './ChatMobile.css'

// ── Types ─────────────────────────────────────────────────────────────────────
type SheetStep = null | 'menu' | 'subject' | 'marks'

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatMobile() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // ── Quick Entry State ──────────────────────────────────────────────────────
    const [sheetStep, setSheetStep] = useState<SheetStep>(null)
    const [subject, setSubject] = useState('')
    const [quizMarks, setQuizMarks] = useState(['', '', '', '', ''])
    const [assignMarks, setAssignMarks] = useState(['', ''])
    const [compreMarks, setCompreMarks] = useState('')

    // ── Load DB ───────────────────────────────────────────────────────────────
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
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [input])

    // ── Sheet helpers ─────────────────────────────────────────────────────────
    const closeSheet = () => {
        setSheetStep(null)
        setSubject('')
        setQuizMarks(['', '', '', '', ''])
        setAssignMarks(['', ''])
        setCompreMarks('')
    }

    const clearChat = async () => {
        await clearAllMessages()
        setMessages([])
    }

    // ── Core send ─────────────────────────────────────────────────────────────
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
                content: `**Connection Error**\n\n${errorMsg}`,
                timestamp: new Date()
            }
            await addMessage(errorMessage)
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

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

    // ── Calculate Grade ───────────────────────────────────────────────────────
    const handleCalculateGrade = () => {
        if (!subject.trim()) return
        const filledQuizzes = quizMarks.map((v, i) => ({ idx: i + 1, val: v })).filter(q => q.val.trim() !== '')
        if (filledQuizzes.length === 0 || !compreMarks.trim()) return

        const quizParts = filledQuizzes.map(q => `  • Quiz ${q.idx}: ${q.val}%`).join('\n')
        const filledAssign = assignMarks.map((v, i) => ({ idx: i + 1, val: v })).filter(a => a.val.trim() !== '')
        const assignParts = filledAssign.length > 0
            ? '\nAssignment marks:\n' + filledAssign.map(a => `  • Assignment ${a.idx}: ${a.val}%`).join('\n')
            : ''

        const prompt =
            `Calculate my grade for ${subject.trim()}:\n\n` +
            `Quiz marks:\n${quizParts}${assignParts}\n\n` +
            `Comprehensive exam: ${compreMarks} out of 50`

        closeSheet()
        dispatchMessage(prompt)
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (!isInitialized) {
        return (
            <div className="m-chat">
                <div className="m-loading">
                    <Loader2 size={28} className="spin" />
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    const sheetOpen = sheetStep !== null

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="m-chat">

            {/* ── Top nav ──────────────────────────────────────────────────────── */}
            <header className="m-topnav">
                <div className="m-nav-center">
                    <Bot size={18} className="m-nav-icon" />
                    <span>Anie</span>
                </div>
            </header>

            {/* ── Messages ──────────────────────────────────────────────────────── */}
            <main className="m-messages">
                {messages.length === 0 ? (
                    <div className="m-empty">
                        <div className="m-empty-icon"><Bot size={40} /></div>
                        <h2>Hi, I'm Anie! 👋</h2>
                        <p>Your BITS CS academic advisor</p>
                        <div className="m-suggestions">
                            <button onClick={() => setInput('Calculate my grade for Web Programming')}>
                                📊 Calculate my grade
                            </button>
                            <button onClick={() => setInput('Tell me about the CS syllabus')}>
                                📚 CS Syllabus
                            </button>
                            <button onClick={() => setInput('Explain the BITS curriculum')}>
                                🏫 BITS Curriculum
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="m-messages-list">
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`m-message ${message.role}`}
                                style={{ animationDelay: `${index * 0.04}s` }}
                            >
                                <div className="m-avatar">
                                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="m-bubble-wrap">
                                    <span className="m-role">
                                        {message.role === 'user' ? 'You' : 'Anie'}
                                        <span className="m-time">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </span>
                                    <div className="m-bubble">
                                        <MessageContent content={message.content} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="m-message assistant">
                                <div className="m-avatar"><Bot size={16} /></div>
                                <div className="m-bubble-wrap">
                                    <span className="m-role">Anie</span>
                                    <div className="m-bubble m-typing">
                                        <span className="dot" style={{ animationDelay: '0s' }} />
                                        <span className="dot" style={{ animationDelay: '0.2s' }} />
                                        <span className="dot" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* ── Bottom Sheet Backdrop ─────────────────────────────────────────── */}
            {sheetOpen && (
                <div className="m-backdrop" onClick={closeSheet} />
            )}

            {/* ── Bottom Sheet ──────────────────────────────────────────────────── */}
            {sheetOpen && (
                <div className="m-sheet">
                    {/* Drag handle */}
                    <div className="m-sheet-handle" />

                    {/* MENU */}
                    {sheetStep === 'menu' && (
                        <div className="m-sheet-content">
                            <div className="m-sheet-header">
                                <span className="m-sheet-title">Tools</span>
                                <button className="m-sheet-close" onClick={closeSheet}><X size={18} /></button>
                            </div>
                            <button className="m-tool-item" onClick={() => setSheetStep('subject')}>
                                <div className="m-tool-icon"><Calculator size={22} /></div>
                                <div className="m-tool-text">
                                    <span className="m-tool-name">Calculate Grade</span>
                                    <span className="m-tool-desc">Enter marks, get instant grade</span>
                                </div>
                                <ChevronRight size={18} className="m-tool-arrow" />
                            </button>
                        </div>
                    )}

                    {/* STEP 1: Subject */}
                    {sheetStep === 'subject' && (
                        <div className="m-sheet-content">
                            <div className="m-sheet-header">
                                <button className="m-back-icon" onClick={() => setSheetStep('menu')}>
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="m-sheet-title">Which subject?</span>
                                <button className="m-sheet-close" onClick={closeSheet}><X size={18} /></button>
                            </div>
                            <div className="m-subject-body">
                                <p className="m-subject-hint">Type the subject name to get started</p>
                                <input
                                    className="m-subject-input"
                                    type="text"
                                    placeholder="e.g. Web Programming, DSA, OOP..."
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && subject.trim()) setSheetStep('marks') }}
                                    autoFocus
                                />
                                <button
                                    className="m-next-btn"
                                    disabled={!subject.trim()}
                                    onClick={() => setSheetStep('marks')}
                                >
                                    Enter Marks <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Marks */}
                    {sheetStep === 'marks' && (
                        <div className="m-sheet-content">
                            <div className="m-sheet-header">
                                <button className="m-back-icon" onClick={() => setSheetStep('subject')}>
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="m-sheet-title">{subject}</span>
                                <button className="m-sheet-close" onClick={closeSheet}><X size={18} /></button>
                            </div>
                            <p className="m-marks-hint">Fill in your marks below</p>

                            <div className="m-marks-scroll">
                                {/* Quizzes */}
                                <p className="m-section-label">📝 Quizzes (out of 100)</p>
                                <div className="m-mark-grid">
                                    {quizMarks.map((val, i) => (
                                        <div key={`quiz-${i}`} className="m-mark-card quiz-card">
                                            <span className="m-mark-card-label">Quiz {i + 1}</span>
                                            <input
                                                className="m-mark-input"
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
                                            <span className="m-mark-max">/100</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Assignments */}
                                <p className="m-section-label">📋 Assignments (out of 100)</p>
                                <div className="m-mark-grid">
                                    {assignMarks.map((val, i) => (
                                        <div key={`assign-${i}`} className="m-mark-card assign-card">
                                            <span className="m-mark-card-label">Assign {i + 1}</span>
                                            <input
                                                className="m-mark-input"
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
                                            <span className="m-mark-max">/100</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Compre */}
                                <p className="m-section-label">🎯 Comprehensive Exam (out of 50)</p>
                                <div className="m-mark-card compre-card m-compre-card">
                                    <span className="m-mark-card-label">Compre</span>
                                    <input
                                        className="m-mark-input m-compre-input"
                                        type="number"
                                        min="0"
                                        max="50"
                                        placeholder="e.g. 38"
                                        value={compreMarks}
                                        onChange={e => setCompreMarks(e.target.value)}
                                    />
                                    <span className="m-mark-max">/50</span>
                                </div>
                            </div>

                            <div className="m-marks-footer">
                                <button
                                    className="m-calc-btn"
                                    onClick={handleCalculateGrade}
                                    disabled={isLoading || quizMarks.every(v => v.trim() === '') || !compreMarks.trim()}
                                >
                                    {isLoading
                                        ? <><Loader2 size={18} className="spin" /> Sending...</>
                                        : <><Calculator size={18} /> Calculate Grade</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Input bar ────────────────────────────────────────────────────────── */}
            <footer className="m-input-bar">
                <div className="m-input-row">
                    {/* + FAB */}
                    <button
                        className={`m-plus-btn ${sheetOpen ? 'm-plus-active' : ''}`}
                        onClick={() => setSheetStep(prev => prev ? null : 'menu')}
                    >
                        {sheetOpen ? <X size={20} /> : <Plus size={20} />}
                    </button>

                    {/* Textarea */}
                    <div className="m-textarea-wrap">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Anie anything..."
                            rows={1}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Clear + Send */}
                    {messages.length > 0 && (
                        <button className="m-clear-btn" onClick={clearChat}>
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        className="m-send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                    </button>
                </div>
            </footer>
        </div>
    )
}
