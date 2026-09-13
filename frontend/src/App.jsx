import { useState } from "react";
import UploadView from "./components/UploadView.jsx";
import ProcessingView from "./components/ProcessingView.jsx";
import ChatView from "./components/ChatView.jsx";
import QuizView from "./components/QuizView.jsx";
import VoiceAssistantView from "./components/VoiceAssistantView.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [currentView, setCurrentView] = useState("UPLOAD");
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
      e.target.value = "";
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
      e.target.value = "";
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

    // Default Chat View with integrated toolbar
    return (
      <ChatView
        activeFile={activeFile}
        onUploadNew={() => setCurrentView("UPLOAD")}
        onOpenVoice={() => setCurrentView("VOICE")}
        onOpenQuiz={() => setCurrentView("QUIZ")}
        messages={messages}
        loading={loading}
        onSendMessage={send}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#070b0d] text-slate-50 font-sans selection:bg-[#DA7B93]/40 relative overflow-hidden flex flex-col">
      {/* Animated Ambient Neon Backgrounds */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-[#376E6F] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-[#DA7B93] rounded-full mix-blend-screen filter blur-[140px] opacity-15 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>

      {/* App Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
