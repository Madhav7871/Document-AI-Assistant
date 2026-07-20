export default function UploadView({ onFileUpload }) {
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
      <h1
        className="header__title"
        style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
      >
        Document AI Assistant
      </h1>
      <p
        className="header__subtitle"
        style={{ maxWidth: "600px", marginBottom: "2rem", opacity: 0.8 }}
      >
        Upload any PDF document to ask questions, extract concepts, and interact
        with your data instantly.
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
        className="suggestion-chip"
        style={{
          cursor: "pointer",
          padding: "12px 24px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          backgroundColor: "#3b82f6",
          color: "white",
          borderRadius: "8px",
        }}
      >
        📤 Choose a PDF File
      </label>
    </div>
  );
}
