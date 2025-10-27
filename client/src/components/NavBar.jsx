// client/src/components/NavBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg px-3">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-lightning-charge-fill text-primary"></i>
          <span>LunaAssist</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topnav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="topnav">
          <div className="navbar-nav">
            <Link className="nav-link d-flex align-items-center gap-1" to="/chat">
              <i className="bi bi-chat-dots"></i> Chat
            </Link>
            <Link className="nav-link d-flex align-items-center gap-1" to="/employees">
              <i className="bi bi-people-fill"></i> Employees
            </Link>
            <Link className="nav-link d-flex align-items-center gap-1" to="/products">
              <i className="bi bi-box-seam"></i> Products
            </Link>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-muted small d-none d-md-inline">Hi, {user.name || user.email}</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-secondary btn-sm" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register">
                  <i className="bi bi-person-plus-fill me-1"></i>Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="glow-line"></div>
    </>
  );
}