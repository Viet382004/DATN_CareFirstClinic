import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "../../../contexts";

const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8001"
const SESSION_ID = "sess_" + Math.random().toString(36).slice(2, 9)

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export function AIChat() {
  const { token: authToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Xin chào! Tôi có thể giúp bạn tư vấn sức khỏe hoặc đặt lịch khám. Bạn cần hỗ trợ gì?"
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput("")
    setMessages(p => [...p, { role: "user", content: text }])
    setLoading(true)
    setMessages(p => [...p, { role: "assistant", content: "", streaming: true }])

    try {
      const res = await fetch(`${AI_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text, 
          session_id: SESSION_ID,
          token: authToken 
        })
      })

      if (!res.ok) {
        throw new Error(`Lỗi HTTP: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Không có dữ liệu trả về");
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              full += data.token
              setMessages(p => {
                const u = [...p]
                u[u.length - 1] = { role: "assistant", content: full, streaming: true }
                return u
              })
            }
            if (data.done) {
              setMessages(p => {
                const u = [...p]
                u[u.length - 1] = { role: "assistant", content: full }
                return u
              })
            }
          } catch { }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(p => {
        const u = [...p]
        u[u.length - 1] = { role: "assistant", content: "Xin lỗi, có lỗi kết nối. Vui lòng kiểm tra lại AI Service." }
        return u
      })
    } finally {
      setLoading(false)
    }
  }

  // --- Styles ---
  const bubble = (isUser: boolean): React.CSSProperties => ({
    maxWidth: "78%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
    borderRadius: 16,
    borderBottomRightRadius: isUser ? 4 : 16,
    borderBottomLeftRadius: isUser ? 16 : 4,
    background: isUser ? "#4f46e5" : "#f3f4f6",
    color: isUser ? "#fff" : "#111",
    whiteSpace: "pre-wrap", wordBreak: "break-word"
  })

  return (
    <>
      {/* FAB button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: 24, left: 24, width: 56, height: 56,
        borderRadius: "50%", background: "#4f46e5", border: "none",
        color: "#fff", fontSize: 24, cursor: "pointer",
        boxShadow: "0 4px 16px rgba(79,70,229,0.4)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, left: 24, width: 360, height: 520,
          background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 9998, overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", background: "#4f46e5", color: "#fff",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
            }}>
              <img 
                src="https://img.freepik.com/free-vector/cute-robot-holding-clipboard-cartoon-vector-icon-illustration-science-technology-icon-concept_138676-5184.jpg?t=st=1714400000~exp=1714403600~hmac=friendly-bot" 
                alt="AI Assistant" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>CareFirstClinic AI</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Trợ lý sức khỏe thân thiện</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={bubble(m.role === "user")}>
                  {m.content || (m.streaming ? "▌" : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Nhập câu hỏi..."
              disabled={loading}
              style={{
                flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb",
                borderRadius: 20, outline: "none", fontSize: 13,
                background: loading ? "#f9f9f9" : "#fff"
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 16px", background: loading ? "#a5b4fc" : "#4f46e5",
                color: "#fff", border: "none", borderRadius: 20,
                cursor: loading ? "default" : "pointer", fontSize: 13
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  )
}