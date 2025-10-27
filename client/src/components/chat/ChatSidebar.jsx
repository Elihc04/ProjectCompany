import { useEffect, useMemo, useRef, useState } from 'react';

export default function ChatSidebar({
  open, onToggle,
  conversations, activeId, onSelect,
  onNew, onRename, onDelete, onClear,
  formatTime, fallbackTitle = 'LunaAssist',
  focusSearchSignal = 0,       // <- số tăng để focus search
  onOpenSearch,                // <- gọi từ rail: mở sidebar + focus search
}) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  // Focus ô tìm khi có signal
  useEffect(() => {
    if (focusSearchSignal > 0) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [focusSearchSignal]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.messages || []).some(m => (m.text || '').toLowerCase().includes(q))
    );
  }, [search, conversations]);

  return (
    <>
      {/* RAIL luôn hiện (desktop) */}
      <div className="sidebar-rail d-none d-lg-flex">
        {/* Nút mở/đóng sidebar */}
        <button
          className="btn btn-light btn-rail"
          title={open ? 'Ẩn menu' : 'Mở menu'}
          onClick={() => onToggle(!open)}
        >
          <i className={`bi ${open ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`}></i>
        </button>

        <div className="rail-sep" />

        {/* Search chats: mở sidebar + focus ô tìm */}
        <button
          className="btn btn-light btn-rail"
          title="Search chats"
          onClick={() => onOpenSearch?.()}
        >
          <i className="bi bi-search"></i>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`chat-sidebar-left ${open ? 'open' : 'collapsed'}`}>
        {open && (
          <div className="sidebar-body p-3 pt-3 d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-magic text-primary"></i> LunaAssist
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onToggle(false)} title="Thu gọn">
                  <i className="bi bi-chevron-left"></i>
                </button>
              </div>
            </div>

            {/* Ô tìm kiếm */}
            <div className="sidebar-search mb-3">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  ref={inputRef}
                  className="form-control"
                  placeholder="Tìm kiếm đoạn chat..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2" onClick={onNew}>
              <i className="bi bi-plus-circle"></i> Đoạn chat mới
            </button>

            <div className="chat-history flex-grow-1">
              {list.map((c) => (
                <div
                  key={c.id}
                  className={`history-item ${c.id === activeId ? 'active' : ''}`}
                  onClick={() => onSelect(c.id)}
                  title={c.title}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="me-2">
                      <div className="title text-truncate">
                        <i className="bi bi-chat-left-text me-1 text-primary"></i>
                        {c.title || fallbackTitle}
                      </div>
                      <div className="time small text-muted">{formatTime(c.updatedAt || c.createdAt)}</div>
                    </div>
                    <div className="actions d-flex gap-2">
                      <button className="btn btn-outline-secondary btn-sm" title="Đổi tên" onClick={(e)=>{e.stopPropagation(); onRename(c.id);}}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" title="Xóa" onClick={(e)=>{e.stopPropagation(); onDelete(c.id);}}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!list.length && (
                <div className="text-muted small">Không tìm thấy đoạn chat phù hợp.</div>
              )}
            </div>

            <div className="pt-2">
              <button className="btn btn-outline-secondary w-100" onClick={onClear}>
                <i className="bi bi-trash me-1"></i> Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}