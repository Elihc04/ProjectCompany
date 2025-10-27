// client/src/components/chat/ChatInput.jsx
import { useMemo } from 'react';

export default function ChatInput({ value, onChange, onSubmit, showSuggest=false }) {
  const suggests = useMemo(() => ([
    'Có bao nhiêu nhân viên?',
    'Tổng giá trị tồn kho?',
    'Liệt kê 5 sản phẩm đầu tiên',
    'Tìm sản phẩm "Laptop"',
  ]), []);

  return (
    <div className="input-dock">
      {showSuggest && (
        <div className="suggest-row">
          {suggests.map((s, i) => (
            <button key={i} type="button" className="suggest-chip" onClick={() => onChange(s)}>
              <i className="bi bi-stars me-1"></i>{s}
            </button>
          ))}
        </div>
      )}
      <form className="input-pill" onSubmit={onSubmit}>
        <i className="bi bi-pencil text-primary"></i>
        <input
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit" title="Gửi">
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
      <div className="small text-muted mt-2">
        LunaAssist có thể sai sót. Hãy kiểm tra thông tin quan trọng.
      </div>
    </div>
  );
}