import React, { useState, useEffect, useRef } from "react";
import "../VoiceAssistant.css";

const VoiceAssistantView = ({ activeFile, onBack }) => {
  // Removed "standby" - now it's just idle, listening, processing, speaking
  const [micState, setMicState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const recognitionRef = useRef(null);

  // Use the same API URL logic as your App.jsx
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setMicState("idle");
        }
      };

      recognitionRef.current.onend = () => {
        // Keep listening if we are still in the listening state
        if (micState === "listening") {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, [micState]);

  const toggleListen = () => {
    if (micState === "idle" || micState === "speaking") {
      setMicState("listening");
      setTranscript("");
      setAiResponse("");
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (micState === "listening") {
      // Manual trigger if user clicks again while listening
      handleSendQuery(transcript);
    } else {
      setMicState("idle");
      recognitionRef.current.stop();
    }
  };

  // Automatically send query when user stops talking (2 seconds of silence)
  useEffect(() => {
    let timeoutId;
    if (micState === "listening" && transcript.trim() !== "") {
      timeoutId = setTimeout(() => {
        handleSendQuery(transcript);
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [transcript, micState]);

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setMicState("processing");
    recognitionRef.current.stop();

    try {
      // FIXED: Sending to /chat with the correct JSON format (message and history)
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          history: [], // Passing empty history for voice queries to keep it simple
        }),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error");
      }

      const data = await response.json();
      const answer =
        data.answer || "I processed your document, but received no answer.";

      setAiResponse(answer);
      setMicState("speaking");
      speakText(answer);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      const errorMsg =
        "Sorry, I encountered an error connecting to the server.";
      setAiResponse(errorMsg);
      setMicState("speaking");
      speakText(errorMsg);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;

      utterance.onend = () => {
        setMicState("idle");
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="voice-assistant-container">
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

      <h2>🎙️ Voice Assistant</h2>
      <p className="subtitle">
        Click the microphone to start, then ask your question.
      </p>

      <div className="mic-wrapper">
        <button
          className={`mic-button ${micState}`}
          onClick={toggleListen}
          disabled={micState === "processing"}
        >
          {micState === "processing" ? (
            <span className="spinner">⏳</span>
          ) : micState === "speaking" ? (
            "🔊"
          ) : (
            "🎤"
          )}
        </button>
      </div>

      <div className="status-text">
        {micState === "idle" && (
          <p className="pulse-text-gray">Click the mic to start</p>
        )}
        {micState === "listening" && (
          <p className="pulse-text-green">Listening to your question...</p>
        )}
        {micState === "processing" && (
          <p className="pulse-text-gray">Analyzing document...</p>
        )}
        {micState === "speaking" && (
          <p className="pulse-text-blue">Speaking...</p>
        )}
      </div>

      <div className="conversation-display">
        {transcript && (
          <div className="user-bubble">
            <strong>You:</strong> {transcript}
          </div>
        )}
        {aiResponse && (
          <div className="ai-bubble">
            <strong>Assistant:</strong> {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistantView;
