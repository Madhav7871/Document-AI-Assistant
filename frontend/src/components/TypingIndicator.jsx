export default function TypingIndicator() {
  return (
    <div className="msg-row">
      <div className="avatar avatar--bot">N</div>
      <div className="bubble bubble--bot">
        <div className="typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
