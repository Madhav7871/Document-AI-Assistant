import React, { useState, useEffect, useRef } from "react";

const VoiceAssistantView = ({ activeFile, onBack }) => {
  const [micState, setMicState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const recognitionRef = useRef(null);
  const stateRef = useRef("idle");
  const timeoutRef = useRef(null);
  const transcriptEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    stateRef.current = micState;
  }, [micState]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, aiResponse]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        if (stateRef.current !== "listening") return;

        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          if (currentTranscript.trim() !== "") {
            handleSendQuery(currentTranscript);
          }
        }, 1500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") setMicState("idle");
      };

      recognitionRef.current.onend = () => {
        if (stateRef.current === "listening") {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleListen = () => {
    if (micState === "idle" || micState === "speaking") {
      window.speechSynthesis.cancel();
      setMicState("listening");
      setTranscript("");
      setAiResponse("");
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (micState === "listening") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (transcript.trim()) handleSendQuery(transcript);
      else setMicState("idle");
    }
  };

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setMicState("processing");
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          history: [],
        }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const answer =
        data.answer || "I couldn't find an answer in the document.";

      setAiResponse(answer);
      speakText(answer);
    } catch (error) {
      console.error("Backend error:", error);
      const errorMsg =
        "Sorry, I encountered an error connecting to the server.";
      setAiResponse(errorMsg);
      speakText(errorMsg);
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Natural") ||
        v.name.includes("Premium"),
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setMicState("speaking");
    utterance.onend = () => setMicState("idle");

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () =>
      window.speechSynthesis.getVoices();
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Determine button styles based on state
  const getMicStyles = () => {
    switch (micState) {
      case "listening":
        return "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)]";
      case "processing":
        return "bg-blue-500 hover:bg-blue-600 animate-pulse";
      case "speaking":
        return "bg-purple-500 hover:bg-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.5)]";
      default:
        return "bg-slate-700 hover:bg-slate-600";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 w-full relative">
      <button
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/50 transition-colors backdrop-blur-md"
        onClick={onBack}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Return to Chat
      </button>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            🎙️ AI Voice Assistant
          </h2>
          <p className="text-slate-400">
            Tap the microphone and start speaking
          </p>
        </div>

        {/* Interactive Microphone Display */}
        <div className="relative flex items-center justify-center mb-10 h-32 w-32">
          {micState === "listening" && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
          )}

          <button
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white transition-all duration-300 ${getMicStyles()}`}
            onClick={toggleListen}
            disabled={micState === "processing"}
          >
            {micState === "processing"
              ? "⏳"
              : micState === "speaking"
                ? "🔊"
                : "🎤"}
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-10">
          {micState === "idle" && (
            <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700">
              Tap to speak
            </span>
          )}
          {micState === "listening" && (
            <span className="px-4 py-1.5 rounded-full bg-emerald-900/30 text-emerald-400 text-sm font-medium border border-emerald-800/50">
              Listening...
            </span>
          )}
          {micState === "processing" && (
            <span className="px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-400 text-sm font-medium border border-blue-800/50">
              Thinking...
            </span>
          )}
          {micState === "speaking" && (
            <span className="px-4 py-1.5 rounded-full bg-purple-900/30 text-purple-400 text-sm font-medium border border-purple-800/50">
              Answering...
            </span>
          )}
        </div>

        {/* Live Transcript Area */}
        <div className="w-full bg-slate-950/50 rounded-2xl p-6 h-64 overflow-y-auto flex flex-col gap-4 border border-slate-800/50">
          {!transcript && !aiResponse ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Your conversation will appear here...
            </div>
          ) : (
            <>
              {transcript && (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 mb-1 mr-1">You</span>
                  <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm leading-relaxed shadow-sm">
                    {transcript}
                  </div>
                </div>
              )}
              {aiResponse && (
                <div className="flex flex-col items-start mt-2">
                  <span className="text-xs text-slate-500 mb-1 ml-1">
                    Assistant
                  </span>
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[95%] text-sm leading-relaxed shadow-sm">
                    {aiResponse}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantView;
