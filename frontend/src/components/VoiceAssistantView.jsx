import React, { useState, useEffect, useRef } from "react";
import "../VoiceAssistant.css";

const VoiceAssistantView = ({ activeFile, onBack }) => {
  const [micState, setMicState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const recognitionRef = useRef(null);
  const stateRef = useRef("idle");
  const timeoutRef = useRef(null);

  // NEW: Ref to handle automatic scrolling
  const transcriptEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    stateRef.current = micState;
  }, [micState]);

  // NEW: Auto-scroll to bottom whenever transcript or response updates
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

    utterance.onstart = () => {
      setMicState("speaking");
    };

    utterance.onend = () => {
      setMicState("idle");
    };

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

  return (
    <div className="voice-assistant-container">
      {/* Background Video Layer */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source
          src="/background/12823215_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div className="bg-overlay"></div>

      {/* Moved Button outside the center wrapper for absolute positioning */}
      <button className="back-to-chat-btn" onClick={onBack}>
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

      <div className="voice-assistant-wrapper content-layer">
        <div className="voice-assistant-card glass-card">
          <div className="voice-header">
            <h2>🎙️ AI Voice Assistant</h2>
            <p className="subtitle">Tap the microphone and start speaking</p>
          </div>

          <div className="mic-display-area">
            <div className={`mic-ring ring-1 ${micState}`}></div>
            <div className={`mic-ring ring-2 ${micState}`}></div>

            <button
              className={`mic-button ${micState}`}
              onClick={toggleListen}
              disabled={micState === "processing"}
            >
              {micState === "processing" ? (
                <span className="spinner">⏳</span>
              ) : micState === "speaking" ? (
                <span className="speaker-icon">🔊</span>
              ) : (
                <span className="mic-icon">🎤</span>
              )}
            </button>
          </div>

          <div className="status-indicator">
            {micState === "idle" && (
              <span className="badge badge-gray">Tap to speak</span>
            )}
            {micState === "listening" && (
              <span className="badge badge-green">Listening...</span>
            )}
            {micState === "processing" && (
              <span className="badge badge-blue">Thinking...</span>
            )}
            {micState === "speaking" && (
              <span className="badge badge-purple">Answering</span>
            )}
          </div>

          <div className="transcript-area">
            {transcript && (
              <div className="message user-message">
                <div className="message-label">You</div>
                <div className="message-content">{transcript}</div>
              </div>
            )}
            {aiResponse && (
              <div className="message ai-message">
                <div className="message-label">Assistant</div>
                <div className="message-content">{aiResponse}</div>
              </div>
            )}
            {!transcript && !aiResponse && (
              <div className="empty-state">
                Your conversation will appear here...
              </div>
            )}
            {/* NEW: Invisible div to force scroll to bottom */}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantView;
