import React, { useState, useEffect, useRef } from "react";

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
  const audioRef = useRef(null);
  const voiceRef = useRef(null);

  const [factIndex, setFactIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current
        .play()
        .catch((err) =>
          console.log("Waiting for interaction to play bg music", err),
        );
    }
    if (voiceRef.current) {
      voiceRef.current
        .play()
        .catch((err) =>
          console.log("Waiting for interaction to play voice", err),
        );
    }

    const startAudioFallback = () => {
      if (audioRef.current)
        audioRef.current
          .play()
          .catch((err) => console.log("Bg music blocked:", err));
      if (voiceRef.current)
        voiceRef.current
          .play()
          .catch((err) => console.log("Voice blocked:", err));
      document.removeEventListener("click", startAudioFallback);
    };

    document.addEventListener("click", startAudioFallback);
    return () => document.removeEventListener("click", startAudioFallback);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % AI_FACTS.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
      const totalEstimatedTime = elapsedTimeInSeconds / (uploadProgress / 100);
      const timeLeft = totalEstimatedTime - elapsedTimeInSeconds;
      setEstimatedTimeLeft(Math.max(0, Math.ceil(timeLeft)));
    } else if (uploadProgress === 100) {
      setEstimatedTimeLeft(0);
    }
  }, [uploadProgress, startTime]);

  useEffect(() => {
    if (uploadProgress === 100) return;
    const timerId = setInterval(() => {
      setEstimatedTimeLeft((prev) => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [uploadProgress]);

  const formatTime = (seconds) => {
    if (seconds === null) return "Calculating time...";
    if (seconds <= 0) return "Almost done...";
    if (seconds < 60) return `${seconds}s remaining`;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedSecs = secs.toString().padStart(2, "0");
    return `${mins}m ${paddedSecs}s remaining`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full relative">
      <audio ref={voiceRef}>
        <source src="/bg music/Processing-bg-audio.mp3" type="audio/mp3" />
      </audio>
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-2xl z-10 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-white mb-8">
          Processing Document...
        </h2>

        {/* Progress Bar Section */}
        <div className="w-full mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-medium text-slate-300">
              {statusText}
            </span>
            <span className="text-xl font-bold text-indigo-400">
              {uploadProgress}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 relative"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Extras: Timer and Facts */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-800/50 py-2 px-4 rounded-lg w-fit mx-auto border border-slate-700/50">
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
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="text-sm font-medium">
              {formatTime(estimatedTimeLeft)}
            </span>
          </div>

          <div className="h-12 flex items-center justify-center">
            <p
              className="text-sm text-slate-400 italic animate-pulse"
              key={factIndex}
            >
              {AI_FACTS[factIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
