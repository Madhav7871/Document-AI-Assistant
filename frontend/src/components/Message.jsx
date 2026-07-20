export default function Message({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "msg-row--user" : ""}`}>
      <div className={`avatar ${isUser ? "avatar--user" : "avatar--bot"}`}>
        {isUser ? "U" : "N"}
      </div>
      <div>
        <div
          className={`bubble ${isUser ? "bubble--user" : "bubble--bot"} ${
            isError ? "bubble--error" : ""
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
