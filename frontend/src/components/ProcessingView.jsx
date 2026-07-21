import React, { useState, useEffect, useRef } from "react";
import "/src/ProcessingView.css";

const AI_FACTS = [
  "AI is analyzing your document structure...",
  "Extracting key concepts and entities...",
  "Chunking text to optimize search accuracy...",
  "Preparing the vector database for your queries...",
  "Almost ready! Connecting the final dots...",
];

export default function ProcessingView({
  statusText = "Reading PDF document...",
  uploadProgress = 0,
}) {
  // --- 1. Audio Refs ---
  const audioRef = useRef(null); // For background music
  const voiceRef = useRef(null); // NEW: For Maya's voice

  // --- 2. States for the new timer and facts ---
  const [factIndex, setFactIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  // --- Effect 1: Audio Autoplay Hack ---
  useEffect(() => {
    // 1. Start background music
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch((err) => {
        console.log("Waiting for interaction to play bg music", err);
      });
    }

    // 2. Start Maya Voice Greeting
    if (voiceRef.current) {
      voiceRef.current.play().catch((err) => {
        console.log("Waiting for interaction to play voice", err);
      });
    }

    // Fallback click listener just in case it gets blocked by the browser
    const startAudioFallback = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.log("Bg music blocked:", err));
      }
      if (voiceRef.current) {
        voiceRef.current
          .play()
          .catch((err) => console.log("Voice blocked:", err));
      }
      document.removeEventListener("click", startAudioFallback);
    };

    document.addEventListener("click", startAudioFallback);

    return () => {
      document.removeEventListener("click", startAudioFallback);
    };
  }, []);

  // --- Effect 2: Rotate interesting facts every 6.5 seconds ---
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % AI_FACTS.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // --- Effect 3: Calculate accurate remaining time based on current progress speed ---
  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;

      // Math: If 10% took 5 seconds, 100% takes 50 seconds.
      const totalEstimatedTime = elapsedTimeInSeconds / (uploadProgress / 100);
      const timeLeft = totalEstimatedTime - elapsedTimeInSeconds;

      setEstimatedTimeLeft(Math.max(0, Math.ceil(timeLeft)));
    } else if (uploadProgress === 100) {
      setEstimatedTimeLeft(0);
    }
  }, [uploadProgress, startTime]);

  // --- Effect 4: Real-time countdown tick ---
  useEffect(() => {
    // Don't run the tick if it's finished
    if (uploadProgress === 100) return;

    const timerId = setInterval(() => {
      setEstimatedTimeLeft((prev) => {
        // If we haven't calculated a time yet, or it's already 0, do nothing
        if (prev === null || prev <= 0) return prev;
        // Otherwise, tick down by 1 second
        return prev - 1;
      });
    }, 1000);

    // Cleanup the interval when component unmounts or progress updates
    return () => clearInterval(timerId);
  }, [uploadProgress]);

  // Format the seconds into a readable string
  const formatTime = (seconds) => {
    if (seconds === null) return "Calculating time...";
    if (seconds <= 0) return "Almost done...";

    if (seconds < 60) return `${seconds}s remaining`;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Pad the seconds with a leading zero if needed (e.g., 1m 05s)
    const paddedSecs = secs.toString().padStart(2, "0");

    return `${mins}m ${paddedSecs}s remaining`;
  };

  return (
    <div className="processing-wrapper">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          filter: "brightness(0.35)",
        }}
      >
        <source
          src="/background/12823215_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Hidden Audio Elements */}
      {/* 1. The Voice Greeting (Plays Once) */}
      <audio ref={voiceRef}>
        <source src="/bg music/Processing-bg-audio.mp3" type="audio/mp3" />
      </audio>

      {/* 2. The Looping Background Music */}
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      {/* The sleek, frosted-glass processing card */}
      <div className="processing-card" style={{ zIndex: 1 }}>
        <h2 className="processing-card__title">Processing Document...</h2>

        {/* Progress Bar Section */}
        <div className="progress-container">
          <div className="progress-stats">
            <span className="status-text">{statusText}</span>
            <span className="percentage-text">{uploadProgress}%</span>
          </div>

          <div className="progress-bar-background">
            <div
              className="progress-bar-fill"
              style={{ width: `${uploadProgress}%` }}
            >
              {/* Optional: Adds a cool glowing effect at the tip of the loading bar */}
              <div className="progress-bar-glow"></div>
            </div>
          </div>
        </div>

        {/* Extras: Timer and Facts */}
        <div className="processing-extras">
          <div className="timer-badge">
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
              className="timer-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {formatTime(estimatedTimeLeft)}
          </div>

          <div className="fact-box">
            <p className="fact-text" key={factIndex}>
              {AI_FACTS[factIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
