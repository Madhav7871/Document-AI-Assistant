import React, { useEffect, useRef } from "react";

export default function UploadView({ onFileUpload }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Set the background volume very low (20% volume)
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }

    // 2. The Autoplay Hack: Start music on the user's first interaction
    const startBackgroundAudio = () => {
      if (audioRef.current) {
        // Attempt to play the audio
        audioRef.current.play().catch((err) => {
          console.log("Browser still blocked audio:", err);
        });
      }
      // Instantly remove the click listener so it only triggers once
      document.removeEventListener("click", startBackgroundAudio);
    };

    // Listen for a click anywhere on the whole page
    document.addEventListener("click", startBackgroundAudio);

    // Cleanup function when the component unmounts
    return () => {
      document.removeEventListener("click", startBackgroundAudio);
    };
  }, []);

  return (
    <div className="upload-wrapper">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source
          src="/background/12823215_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div className="upload-overlay"></div>

      {/* Hidden Audio Element - Notice there is no 'autoPlay' attribute here */}
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      {/* The sleek, frosted-glass card */}
      <div className="upload-card">
        <h1 className="upload-card__title">Document AI Assistant</h1>

        <p className="upload-card__subtitle">
          Upload any PDF document to ask questions, extract concepts, and
          interact with your data instantly.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={onFileUpload}
          id="pdf-upload"
          hidden
        />

        {/* Removed the nested <button>, keeping only the <label> as the button */}
        <label htmlFor="pdf-upload" className="upload-btn">
          <span className="upload-btn__icon">
            {/* Modern 'FileUp' SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          </span>
          Choose a PDF File
        </label>
      </div>
    </div>
  );
}
