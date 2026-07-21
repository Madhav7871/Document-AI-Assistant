import React from "react";
// Make sure your CSS is imported here
// import "./Message.css";

export default function Message({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "msg-row--user" : "msg-row--bot"}`}>
      <div
        className={`bubble ${isUser ? "bubble--user" : "bubble--bot"} ${
          isError ? "bubble--error" : ""
        }`}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {content}
      </div>
    </div>
  );
}
