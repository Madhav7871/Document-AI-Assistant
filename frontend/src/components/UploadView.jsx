import React, { useEffect, useRef, useState } from "react";

export default function UploadView({ onFileUpload }) {
  const audioRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }

    const startBackgroundAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Browser still blocked audio:", err);
        });
      }
      document.removeEventListener("click", startBackgroundAudio);
    };

    document.addEventListener("click", startBackgroundAudio);

    return () => {
      document.removeEventListener("click", startBackgroundAudio);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      onFileUpload(mockEvent);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full">
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      <div className="text-center mb-14 pointer-events-none z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-xl">
          Document AI <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#376E6F] via-[#DA7B93] to-[#DA7B93] drop-shadow-[0_0_20px_rgba(218,123,147,0.4)]">
            Assistant
          </span>
        </h1>
        <p className="text-lg text-[#cbd5e1] max-w-xl mx-auto font-medium tracking-wide">
          Upload any PDF document to ask questions, extract concepts, and
          interact with your data instantly.
        </p>
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={onFileUpload}
        id="pdf-upload"
        hidden
      />

      <label
        htmlFor="pdf-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-lg p-12 border-2 border-dashed rounded-3xl transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer group shadow-2xl z-10 ${
          isDragging
            ? "bg-[#2F4454]/60 border-[#DA7B93] scale-105 shadow-[0_0_40px_rgba(218,123,147,0.4)]"
            : "bg-[#1C3334]/40 border-[#376E6F]/60 backdrop-blur-sm hover:bg-[#2F4454]/50 hover:border-[#DA7B93] hover:shadow-[0_0_30px_rgba(218,123,147,0.2)] hover:-translate-y-2"
        }`}
      >
        <div
          className={`p-5 rounded-2xl transition-all duration-300 ${
            isDragging
              ? "bg-[#DA7B93] text-white shadow-[0_0_20px_rgba(218,123,147,0.6)] animate-bounce"
              : "bg-[#2E151B] text-[#DA7B93] group-hover:bg-[#DA7B93] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(218,123,147,0.5)] group-hover:scale-110"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 12v6" />
            <path d="m15 15-3-3-3 3" />
          </svg>
        </div>

        <div className="text-center pointer-events-none">
          <span className="block text-white text-lg font-semibold mb-2 transition-all">
            {isDragging
              ? "Drop your PDF right here!"
              : "Click to upload or drag and drop"}
          </span>
          <span className="block text-sm text-[#8fa9a9] tracking-wider uppercase">
            PDF documents only
          </span>
        </div>

        <div className="mt-4 px-8 py-3.5 bg-gradient-to-r from-[#376E6F] to-[#DA7B93] hover:from-[#DA7B93] hover:to-[#376E6F] text-white font-bold tracking-wide rounded-xl transition-all duration-500 shadow-[0_0_20px_rgba(55,110,111,0.4)] hover:shadow-[0_0_30px_rgba(218,123,147,0.6)] w-full text-center pointer-events-none border border-white/10">
          Choose File
        </div>
      </label>
    </div>
  );
}
