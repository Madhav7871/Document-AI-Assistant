import React, { useState, useEffect, useRef } from "react";
import "../VoiceAssistant.css";

const VoiceAssistantView = ({ activeFile, onBack }) => {
  const [micState, setMicState] = useState("idle"); // "idle", "standby", "listening", "processing", "speaking"
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Reference to hold the SpeechRecognition instance
  const recognitionRef = useRef(null);

  // Generate the wake word by removing the .pdf extension and making it lowercase
  const wakeWord = activeFile
    ? activeFile.replace(/\.[^/.]+$/, "").toLowerCase()
    : "assistant";

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Needs to be continuous for standby mode
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        const lowerTranscript = currentTranscript.toLowerCase();
        setTranscript(currentTranscript);

        // --- WAKE WORD LOGIC ---
        // If we are in standby mode and the user says the document name
        if (micState === "standby" && lowerTranscript.includes(wakeWord)) {
          setMicState("listening");
          setTranscript(""); // Clear transcript to start fresh for the actual query
          console.log(
            `Wake word '${wakeWord}' detected! Listening for query...`,
          );
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setMicState("idle");
        }
      };

      recognitionRef.current.onend = () => {
        // If it stops but we are still supposed to be listening/standby, restart it
        if (micState === "standby" || micState === "listening") {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore errors if it's already started
          }
        }
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, [micState, wakeWord]);

  // Handle the state transitions when the button is clicked
  const toggleListen = () => {
    if (micState === "idle" || micState === "speaking") {
      setMicState("standby");
      setTranscript("");
      setAiResponse("");
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (micState === "listening") {
      // Manual trigger to send the query if they don't want to wait
      handleSendQuery(transcript);
    } else {
      setMicState("idle");
      recognitionRef.current.stop();
    }
  };

  // Automatically send query when user stops talking (simulated via timeout)
  useEffect(() => {
    let timeoutId;
    if (micState === "listening" && transcript.trim() !== "") {
      timeoutId = setTimeout(() => {
        handleSendQuery(transcript);
      }, 2000); // Wait 2 seconds of silence before sending
    }
    return () => clearTimeout(timeoutId);
  }, [transcript, micState]);

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setMicState("processing");
    recognitionRef.current.stop();

    try {
      // Replace with your actual FastAPI endpoint for RAG queries
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText }),
      });

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
        setMicState("idle"); // Return to idle when done speaking
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="voice-assistant-container">
      {/* Back Button */}
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
        Click to enter Standby mode. Say <strong>"{wakeWord}"</strong> to
        activate, then ask your question.
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
        {micState === "standby" && (
          <p className="pulse-text-blue">
            Waiting for wake word: "{wakeWord}"...
          </p>
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
