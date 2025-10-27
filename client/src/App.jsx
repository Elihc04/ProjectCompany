import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');

  const logout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-light bg-light rounded mb-4 px-3">
        <Link className="navbar-brand" to="/">LunaAssist</Link>
        <div className="ms-auto d-flex gap-2">
          {auth ? (
            <>
              <span className="navbar-text d-none d-sm-inline">Hi, {auth.user?.name || auth.user?.email}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={logout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-primary btn-sm" to="/login">Đăng nhập</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}