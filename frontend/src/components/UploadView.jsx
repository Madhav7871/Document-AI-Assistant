import React from "react";

export default function UploadView({ onFileUpload }) {
  return (
    <div className="upload-wrapper">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source
          src="/background/16458939-uhd_3840_2160_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* A dark overlay to make the card pop */}
      <div className="upload-overlay"></div>

      {/* The new Glassmorphism Card */}
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
          Choose a PDF File
        </label>
      </div>
    </div>
  );
}
