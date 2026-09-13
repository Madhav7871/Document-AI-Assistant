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
    if (transcriptEndRef.current)
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
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
        for (let i = event.resultIndex; i < event.results.length; ++i)
          currentTranscript += event.results[i][0].transcript;
        setTranscript(currentTranscript);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (currentTranscript.trim() !== "")
            handleSendQuery(currentTranscript);
        }, 1500);
      };
      recognitionRef.current.onerror = (event) => {
        if (event.error !== "no-speech") setMicState("idle");
      };
      recognitionRef.current.onend = () => {
        if (stateRef.current === "listening")
          try {
            recognitionRef.current.start();
          } catch (e) {}
      };
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
    if (recognitionRef.current) recognitionRef.current.abort();
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText, history: [] }),
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      const answer =
        data.answer || "I couldn't find an answer in the document.";
      setAiResponse(answer);
      speakText(answer);
    } catch (error) {
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
    utterance.onstart = () => setMicState("speaking");
    utterance.onend = () => setMicState("idle");
    window.speechSynthesis.speak(utterance);
  };

  const getMicStyles = () => {
    switch (micState) {
      case "listening":
        return "bg-[#DA7B93] text-white shadow-[0_0_50px_rgba(218,123,147,0.8)] scale-110 animate-[pulse_1s_ease-in-out_infinite]";
      case "processing":
        return "bg-[#376E6F] text-white shadow-[0_0_40px_rgba(55,110,111,0.8)] animate-spin";
      case "speaking":
        return "bg-[#2F4454] text-[#DA7B93] shadow-[0_0_40px_rgba(218,123,147,0.5)] scale-105 border-2 border-[#DA7B93]";
      default:
        return "bg-[#2E151B] text-[#DA7B93] hover:bg-[#DA7B93] hover:text-white border-2 border-[#DA7B93]/50 hover:shadow-[0_0_30px_rgba(218,123,147,0.6)]";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 w-full relative z-10">
      <button
        className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 bg-[#1C3334] hover:bg-[#376E6F] text-white font-bold rounded-xl border border-[#376E6F]/50 transition-all duration-300 shadow-[0_0_15px_rgba(55,110,111,0.2)] hover:shadow-[0_0_25px_rgba(55,110,111,0.5)]"
        onClick={onBack}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Return to Chat
      </button>

      <div className="w-full max-w-2xl bg-[#070b0d]/80 backdrop-blur-2xl border border-[#376E6F]/40 rounded-[2.5rem] p-10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#376E6F] to-[#DA7B93] mb-3">
            🎙️ AI Voice Assistant
          </h2>
          <p className="text-[#8fa9a9] font-medium tracking-wide">
            Tap the microphone and start speaking
          </p>
        </div>

        <div className="relative flex items-center justify-center mb-12 h-36 w-36">
          {micState === "listening" && (
            <div className="absolute inset-0 rounded-full border-4 border-[#DA7B93] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40"></div>
          )}
          <button
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-500 ${getMicStyles()}`}
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

        <div className="mb-10">
          {micState === "idle" && (
            <span className="px-5 py-2 rounded-full bg-[#1C3334] text-[#8fa9a9] text-sm font-bold tracking-widest uppercase border border-[#376E6F]/40">
              Tap to speak
            </span>
          )}
          {micState === "listening" && (
            <span className="px-5 py-2 rounded-full bg-[#2E151B] text-[#DA7B93] text-sm font-bold tracking-widest uppercase border border-[#DA7B93]/50 shadow-[0_0_15px_rgba(218,123,147,0.3)]">
              Listening...
            </span>
          )}
          {micState === "processing" && (
            <span className="px-5 py-2 rounded-full bg-[#376E6F]/20 text-[#376E6F] text-sm font-bold tracking-widest uppercase border border-[#376E6F]/50 shadow-[0_0_15px_rgba(55,110,111,0.3)]">
              Thinking...
            </span>
          )}
          {micState === "speaking" && (
            <span className="px-5 py-2 rounded-full bg-[#2F4454] text-white text-sm font-bold tracking-widest uppercase border border-[#376E6F]/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Answering...
            </span>
          )}
        </div>

        <div className="w-full bg-[#070b0d] rounded-3xl p-8 h-72 overflow-y-auto flex flex-col gap-5 border-2 border-[#1C3334] shadow-inner">
          {!transcript && !aiResponse ? (
            <div className="h-full flex items-center justify-center text-[#8fa9a9] text-sm font-medium tracking-wide">
              Your conversation will appear here...
            </div>
          ) : (
            <>
              {transcript && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-[#376E6F] uppercase tracking-wider mb-2 mr-2">
                    You
                  </span>
                  <div className="bg-gradient-to-br from-[#DA7B93] to-[#a84f67] text-white px-6 py-4 rounded-3xl rounded-tr-sm max-w-[85%] text-sm font-medium leading-relaxed shadow-[0_5px_15px_rgba(218,123,147,0.3)]">
                    {transcript}
                  </div>
                </div>
              )}
              {aiResponse && (
                <div className="flex flex-col items-start mt-4">
                  <span className="text-xs font-bold text-[#DA7B93] uppercase tracking-wider mb-2 ml-2">
                    Assistant
                  </span>
                  <div className="bg-[#1C3334] border border-[#376E6F]/40 text-[#f7f7f7] px-6 py-4 rounded-3xl rounded-tl-sm max-w-[95%] text-sm font-medium leading-relaxed shadow-lg">
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
