import { useState } from "react";
import UploadView from "./components/UploadView.jsx";
import ProcessingView from "./components/ProcessingView.jsx";
import ChatView from "./components/ChatView.jsx";
import QuizView from "./components/QuizView.jsx";
import VoiceAssistantView from "./components/VoiceAssistantView.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [currentView, setCurrentView] = useState("UPLOAD"); // "UPLOAD", "PROCESSING", "CHAT", "QUIZ", or "VOICE"
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [activeFile, setActiveFile] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.");
      e.target.value = ""; // Clear input
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setCurrentView("PROCESSING");
    setUploadProgress(5);
    setStatusText("Uploading file...");

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload PDF.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.progress !== undefined) setUploadProgress(data.progress);
            if (data.status) setStatusText(data.status);
          } catch (err) {
            console.error("Failed to parse line", err);
          }
        }
      }

      setActiveFile(file.name);
      setMessages([
        {
          role: "assistant",
          content: `📄 **${file.name}** indexed successfully! What would you like to know?`,
        },
      ]);
      setCurrentView("CHAT");
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
      setCurrentView("UPLOAD");
    } finally {
      e.target.value = ""; // Reset file input so user can upload same file again if needed
    }
  };

  const send = async (text) => {
    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory
            .slice(0, -1)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) throw new Error("Something went wrong on the server.");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW ROUTING ENCAPSULATED FOR GLOBAL THEME WRAPPER ---
  const renderContent = () => {
    if (currentView === "UPLOAD") {
      return <UploadView onFileUpload={handleFileUpload} />;
    }

    if (currentView === "PROCESSING") {
      return (
        <ProcessingView
          statusText={statusText}
          uploadProgress={uploadProgress}
        />
      );
    }

    if (currentView === "QUIZ") {
      return (
        <QuizView
          activeFile={activeFile}
          onBack={() => setCurrentView("CHAT")}
        />
      );
    }

    if (currentView === "VOICE") {
      return (
        <VoiceAssistantView
          activeFile={activeFile}
          onBack={() => setCurrentView("CHAT")}
        />
      );
    }

    // Default Chat View
    return (
      <>
        <div className="absolute top-8 right-52 z-50 flex gap-3">
          <button
            onClick={() => setCurrentView("VOICE")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700/50 backdrop-blur-md transition-all shadow-sm"
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
            Voice Assistant
          </button>

          <button
            onClick={() => setCurrentView("QUIZ")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700/50 backdrop-blur-md transition-all shadow-sm"
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
            Take a Quiz
          </button>
        </div>

        <ChatView
          activeFile={activeFile}
          onUploadNew={() => setCurrentView("UPLOAD")}
          messages={messages}
          loading={loading}
          onSendMessage={send}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 relative">
      {renderContent()}
    </div>
  );
}
