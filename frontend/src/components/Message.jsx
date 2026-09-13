import React from "react";

export default function Message({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl leading-relaxed shadow-sm whitespace-pre-wrap ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/20"
            : isError
              ? "bg-red-900/20 border border-red-500/50 text-red-200 rounded-tl-sm"
              : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
