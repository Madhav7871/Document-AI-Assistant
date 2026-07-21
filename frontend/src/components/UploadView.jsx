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

        <label htmlFor="pdf-upload" className="upload-btn">
          <span className="upload-btn__icon">📤</span> Choose a PDF File
        </label>
      </div>
    </div>
  );
}
