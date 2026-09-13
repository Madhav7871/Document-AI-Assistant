import React, { useEffect, useRef } from "react";

export default function UploadView({ onFileUpload }) {
  const audioRef = useRef(null);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      {/* Main UI */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Document AI <span className="text-indigo-500">Assistant</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
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
        className="w-full max-w-md p-10 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group shadow-xl shadow-black/20"
      >
        <div className="p-4 bg-slate-800 rounded-full group-hover:bg-indigo-900/30 group-hover:text-indigo-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 group-hover:text-indigo-400 transition-colors"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 12v6" />
            <path d="m15 15-3-3-3 3" />
          </svg>
        </div>

        <div className="text-center">
          <span className="block text-slate-200 font-semibold mb-1">
            Click to upload or drag and drop
          </span>
          <span className="block text-sm text-slate-500">
            PDF documents only
          </span>
        </div>

        <div className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-900/20 w-full text-center">
          Choose File
        </div>
      </label>
    </div>
  );
}
