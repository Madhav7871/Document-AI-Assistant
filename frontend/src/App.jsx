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

  // --- VIEW ROUTING ---

  if (currentView === "UPLOAD") {
    return <UploadView onFileUpload={handleFileUpload} />;
  }

  if (currentView === "PROCESSING") {
    return (
      <ProcessingView statusText={statusText} uploadProgress={uploadProgress} />
    );
  }

  if (currentView === "QUIZ") {
    return (
      <QuizView activeFile={activeFile} onBack={() => setCurrentView("CHAT")} />
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

  // --- DEFAULT (CHAT) VIEW ---
  return (
    <>
      {/* 
        Container for the extra header buttons. 
        Placed at right: 210px to leave room for your "Return to Home" button.
      */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          right: "210px",
          zIndex: 100,
          display: "flex",
          gap: "12px",
        }}
      >
        {/* Voice Assistant Button */}
        <button
          onClick={() => setCurrentView("VOICE")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#e2e8f0",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "400",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
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

        {/* Quiz Button */}
        <button
          onClick={() => setCurrentView("QUIZ")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#e2e8f0",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "400",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
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
}
