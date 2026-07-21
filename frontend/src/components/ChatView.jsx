import { useEffect, useRef, useState } from "react";
import Message from "./Message.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import "/src/ChatView.css";

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
    <div className="chat-wrapper">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="chat-background-video">
        <source
          src="/background/12823215_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Main Glass Container - Restored to keep the frosted glass look! */}
      <div className="chat-glass-container">
        <header className="chat-header">
          <div>
            <div className="header__eyebrow">
              <span className="header__dot"></span>
              Grounded in {activeFile}
            </div>
            <h1 className="header__title">Document AI</h1>
          </div>

          {/* Return to Home Button */}
          <button className="new-upload-btn" onClick={onUploadNew}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Return to Home
          </button>
        </header>

        {/* Message rendering with asterisk cleanup */}
        <main className="chat-messages" ref={chatRef}>
          {messages.map((m, i) => {
            // This strips out the '**' from either a 'text' or 'content' property
            const cleanMessage = {
              ...m,
              text: m.text ? m.text.replace(/\*\*/g, "") : m.text,
              content: m.content ? m.content.replace(/\*\*/g, "") : m.content,
            };
            return <Message key={i} {...cleanMessage} />;
          })}
          {loading && <TypingIndicator />}
        </main>

        {/* Composer / Input Box */}
        <div className="chat-composer">
          {messages.length === 1 && (
            <div className="suggestions">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
