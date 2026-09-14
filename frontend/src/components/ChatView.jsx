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
  onOpenVoice,
  onOpenQuiz,
  messages,
  loading,
  onSendMessage,
}) {
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

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
    <div className="flex flex-col items-center pt-8 pb-8 px-4 h-screen w-full overflow-hidden">
      {/* Top Header & Button Toolbar */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-5 bg-[#1C3334]/40 backdrop-blur-md border border-[#376E6F]/40 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] shrink-0 z-10">
        <div>
          <div className="text-xs font-mono tracking-widest text-[#DA7B93] uppercase flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#DA7B93] shadow-[0_0_10px_rgba(218,123,147,0.8)] animate-pulse"></span>
            Grounded in {activeFile}
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f7f7f7] to-[#8fa9a9]">
            Document AI
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C3334]/80 hover:bg-[#376E6F] text-[#f7f7f7] text-sm font-semibold rounded-xl border border-[#376E6F]/50 transition-all duration-300 shadow-[0_0_15px_rgba(55,110,111,0.3)] hover:shadow-[0_0_20px_rgba(55,110,111,0.6)] hover:-translate-y-0.5"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            Voice
          </button>

          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E151B]/80 hover:bg-[#DA7B93] text-[#f7f7f7] text-sm font-semibold rounded-xl border border-[#DA7B93]/50 transition-all duration-300 shadow-[0_0_15px_rgba(218,123,147,0.3)] hover:shadow-[0_0_20px_rgba(218,123,147,0.6)] hover:-translate-y-0.5"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
            Quiz
          </button>

          <button
            onClick={onUploadNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#070b0d]/60 hover:bg-[#2F4454] text-[#f7f7f7] text-sm font-semibold rounded-xl border border-[#376E6F]/30 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(47,68,84,0.5)] hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <main
        className="w-full max-w-4xl flex-1 overflow-y-auto flex flex-col gap-6 pr-2 z-10"
        ref={chatRef}
      >
        {messages.map((m, i) => {
          const cleanMessage = {
            ...m,
            text: m.text ? m.text.replace(/\*\*/g, "") : m.text,
            content: m.content ? m.content.replace(/\*\*/g, "") : m.content,
          };
          return <Message key={i} {...cleanMessage} />;
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1C3334]/60 border border-[#376E6F]/40 p-4 rounded-2xl rounded-tl-sm backdrop-blur-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
      </main>

      {/* Composer / Input Box */}
      <div className="w-full max-w-4xl mt-4 shrink-0 z-10">
        {messages.length === 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSendMessage(s)}
                disabled={loading}
                className="px-5 py-2.5 text-xs md:text-sm font-medium bg-[#1C3334]/80 border border-[#376E6F]/50 hover:border-[#DA7B93] hover:text-[#DA7B93] text-[#cbd5e1] rounded-full transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(218,123,147,0.3)] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative flex items-end w-full bg-[#070b0d]/90 backdrop-blur-xl border border-[#376E6F]/50 rounded-2xl overflow-hidden focus-within:border-[#DA7B93] focus-within:ring-1 focus-within:ring-[#DA7B93] transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            className="w-full max-h-32 bg-transparent p-4 text-white outline-none placeholder:text-[#376E6F] resize-none font-medium"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3.5 mb-1 mr-1 bg-gradient-to-r from-[#376E6F] to-[#DA7B93] hover:from-[#DA7B93] hover:to-[#376E6F] disabled:from-[#1C3334] disabled:to-[#1C3334] disabled:text-[#376E6F] text-white rounded-xl transition-all duration-500 flex shrink-0 items-center justify-center shadow-[0_0_15px_rgba(218,123,147,0.4)] disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
  );
}
