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
      audioRef.current.play().catch(() => {});
    }
    if (voiceRef.current) voiceRef.current.play().catch(() => {});

    const startAudioFallback = () => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
      if (voiceRef.current) voiceRef.current.play().catch(() => {});
      document.removeEventListener("click", startAudioFallback);
    };
    document.addEventListener("click", startAudioFallback);
    return () => document.removeEventListener("click", startAudioFallback);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setFactIndex((prev) => (prev + 1) % AI_FACTS.length),
      6500,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
      const totalEstimatedTime = elapsedTimeInSeconds / (uploadProgress / 100);
      setEstimatedTimeLeft(
        Math.max(0, Math.ceil(totalEstimatedTime - elapsedTimeInSeconds)),
      );
    } else if (uploadProgress === 100) {
      setEstimatedTimeLeft(0);
    }
  }, [uploadProgress, startTime]);

  useEffect(() => {
    if (uploadProgress === 100) return;
    const timerId = setInterval(() => {
      setEstimatedTimeLeft((prev) =>
        prev === null || prev <= 0 ? prev : prev - 1,
      );
    }, 1000);
    return () => clearInterval(timerId);
  }, [uploadProgress]);

  const formatTime = (seconds) => {
    if (seconds === null) return "Calculating time...";
    if (seconds <= 0) return "Almost done...";
    if (seconds < 60) return `${seconds}s remaining`;
    return `${Math.floor(seconds / 60)}m ${(seconds % 60).toString().padStart(2, "0")}s remaining`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full relative z-10">
      <audio ref={voiceRef}>
        <source src="/bg music/Processing-bg-audio.mp3" type="audio/mp3" />
      </audio>
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      <div className="w-full max-w-xl bg-[#070b0d]/80 backdrop-blur-xl border border-[#376E6F]/50 rounded-3xl p-10 md:p-12 shadow-[0_0_40px_rgba(55,110,111,0.2)] flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#1C3334] border-t-[#DA7B93] animate-spin mb-8 shadow-[0_0_20px_rgba(218,123,147,0.5)]"></div>
        <h2 className="text-3xl font-extrabold text-white mb-10 tracking-tight">
          Processing Document...
        </h2>

        <div className="w-full mb-12">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-semibold text-[#8fa9a9] tracking-wide uppercase">
              {statusText}
            </span>
            <span className="text-2xl font-black text-[#DA7B93] drop-shadow-[0_0_10px_rgba(218,123,147,0.5)]">
              {uploadProgress}%
            </span>
          </div>

          <div className="w-full h-4 bg-[#1C3334] rounded-full overflow-hidden shadow-inner border border-[#376E6F]/30">
            <div
              className="h-full bg-gradient-to-r from-[#376E6F] via-[#DA7B93] to-[#DA7B93] transition-all duration-300 relative shadow-[0_0_15px_rgba(218,123,147,0.8)]"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-center gap-3 text-[#DA7B93] bg-[#2E151B]/60 py-3 px-6 rounded-xl w-fit mx-auto border border-[#DA7B93]/30 shadow-[0_0_15px_rgba(218,123,147,0.1)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="text-sm font-bold tracking-wide">
              {formatTime(estimatedTimeLeft)}
            </span>
          </div>
          <div className="h-12 flex items-center justify-center mt-4">
            <p
              className="text-sm text-[#376E6F] font-medium tracking-wide animate-pulse"
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
