// client/src/components/chat/ChatMessages.jsx
export default function ChatMessages({ messages, endRef }) {
  const copy = (text) => navigator.clipboard?.writeText(text).catch(()=>{});
  return (
    <div className="chat-window mb-3">
      {messages.map((m, i) => (
        <div key={i} className={`message-row ${m.sender}`}>
          <div className={`avatar ${m.sender === 'me' ? '' : 'bot'}`}>
            {m.sender === 'me' ? <i className="bi bi-person"></i> : <i className="bi bi-robot"></i>}
          </div>
          <div className="bubble-wrap">
            <div className="bubble">{m.text}</div>
            {m.sender !== 'me' && (
              <button className="btn btn-sm btn-light copy-btn" onClick={() => copy(m.text)} title="Sao chép">
                <i className="bi bi-clipboard"></i>
              </button>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}