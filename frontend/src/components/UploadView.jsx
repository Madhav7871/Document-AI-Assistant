export default function UploadView({ onFileUpload }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100vh", // Forces full screen height
        width: "100vw", // Forces full screen width
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
          objectFit: "cover", // Ensures the video covers the whole area without stretching
          zIndex: -1,
          filter: "brightness(0.35)", // Slightly darker so the white text is easy to read
        }}
      >
        <source
          src="/background/16458939-uhd_3840_2160_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Foreground Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "1rem",
            color: "#ffffff",
            fontFamily: "serif",
          }}
        >
          Document AI Assistant
        </h1>
        <p
          style={{
            maxWidth: "600px",
            margin: "0 auto 2.5rem auto",
            color: "#e5e7eb",
            fontSize: "1.2rem",
            lineHeight: "1.6",
          }}
        >
          Upload any PDF document to ask questions, extract concepts, and
          interact with your data instantly.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={onFileUpload}
          style={{ display: "none" }}
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          style={{
            cursor: "pointer",
            padding: "16px 32px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            transition: "transform 0.2s",
          }}
        >
          📤 Choose a PDF File
        </label>
      </div>
    </div>
  );
}
