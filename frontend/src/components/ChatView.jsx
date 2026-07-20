import { useEffect, useRef, useState } from "react";
import Message from "./Message.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const SUGGESTIONS = [
  "What are the main topics discussed in this document?",
  "Summarize the key takeaways from the introduction",
  "Explain the core concepts mentioned here",
];

export default function ChatView({
  activeFile,
  onUploadNew,
  messages,
  loading,
  onSendMessage,
}) {
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app">
      <header
        className="header"
        style={{
          borderBottom: "1px solid #374151",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div className="header__eyebrow">
            <span
              className="header__dot"
              style={{ backgroundColor: "#10b981" }}
            />
            Grounded in {activeFile}
          </div>
          <h1
            className="header__title"
            style={{ fontSize: "1.5rem", margin: "5px 0" }}
          >
            Document AI
          </h1>
        </div>

        <button
          onClick={onUploadNew}
          style={{
            background: "none",
            border: "1px solid #4b5563",
            color: "#d1d5db",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload New PDF
        </button>
      </header>

      <main className="chat" ref={chatRef}>
        {messages.map((m, i) => (
          <Message key={i} {...m} />
        ))}
        {loading && <TypingIndicator />}
      </main>

      <div className="composer">
        {messages.length === 1 && (
          <div className="suggestions" style={{ marginBottom: "10px" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="suggestion-chip"
                onClick={() => {
                  onSendMessage(s);
                }}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form className="composer__form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="composer__input"
            placeholder="Ask about the document..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="composer__send"
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
