import React from "react";

export default function Message({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl leading-relaxed shadow-lg whitespace-pre-wrap font-medium tracking-wide ${
          isUser
            ? "bg-gradient-to-br from-[#DA7B93] to-[#a84f67] text-white rounded-tr-sm shadow-[0_5px_20px_rgba(218,123,147,0.3)]"
            : isError
              ? "bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] rounded-tl-sm"
              : "bg-[#1C3334]/80 backdrop-blur-md border border-[#376E6F]/40 text-[#f7f7f7] rounded-tl-sm shadow-[0_5px_20px_rgba(0,0,0,0.3)]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
