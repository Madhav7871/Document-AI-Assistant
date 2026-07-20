export default function ProcessingView({ statusText, uploadProgress }) {
  return (
    <div
      className="app"
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h2 style={{ marginBottom: "2rem" }}>Processing Document...</h2>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontSize: "0.9rem",
            color: "#9ca3af",
          }}
        >
          <span>{statusText}</span>
          <span>{uploadProgress}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#374151",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${uploadProgress}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
