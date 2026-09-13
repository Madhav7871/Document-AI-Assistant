import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span
        className="w-2.5 h-2.5 rounded-full bg-[#DA7B93] animate-bounce shadow-[0_0_8px_rgba(218,123,147,0.8)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2.5 h-2.5 rounded-full bg-[#376E6F] animate-bounce shadow-[0_0_8px_rgba(55,110,111,0.8)]"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2.5 h-2.5 rounded-full bg-[#DA7B93] animate-bounce shadow-[0_0_8px_rgba(218,123,147,0.8)]"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}
