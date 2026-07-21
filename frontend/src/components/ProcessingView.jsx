import React, { useEffect, useRef } from "react";

export default function ProcessingView({ statusText, uploadProgress }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Set the background volume low (20% volume)
    if (audioRef.current) {
      audioRef.current.volume = 0.2;

      // Try to play immediately since the user likely already interacted on the previous screen
      audioRef.current.play().catch((err) => {
        console.log("Waiting for interaction to play audio", err);
      });
    }

    // 2. Fallback click listener just in case it gets blocked
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
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: "2rem",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
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

      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop>
        <source
          src="/bg music/the_mountain-documentary-light-153631.mp3"
          type="audio/mp3"
        />
      </audio>

      {/* Foreground Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2
          style={{ marginBottom: "2rem", color: "#ffffff", fontSize: "2rem" }}
        >
          Processing Document...
        </h2>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              fontSize: "1rem",
              color: "#e5e7eb",
              fontWeight: "500",
            }}
          >
            <span>{statusText}</span>
            <span>{uploadProgress}%</span>
          </div>

          <div
            style={{
              width: "100%",
              height: "16px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
                transition: "width 0.3s ease",
                boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
