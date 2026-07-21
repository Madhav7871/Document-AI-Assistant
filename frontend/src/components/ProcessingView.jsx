export default function ProcessingView({ statusText, uploadProgress }) {
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
