import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

const isPwComplex = (pw) => /[A-Za-z]/.test(pw || '') && /\d/.test(pw || '') && (pw || '').length >= 6;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const flash = loc.state?.flash || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email) return setErr('Vui lòng nhập email');
    if (!password) return setErr('Vui lòng nhập mật khẩu');
    if (!isPwComplex(password)) return setErr('Mật khẩu phải tối thiểu 6 ký tự, gồm cả chữ và số');

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('auth', JSON.stringify(data));
      nav('/', { replace: true });
    } catch (ex) {
      const status = ex?.response?.status;
      const code = ex?.response?.data?.code;
      const msg = ex?.response?.data?.message;

      if (code === 'INVALID_PASSWORD' || status === 401) setErr('Đăng nhập không thành công. Mật khẩu không hợp lệ');
      else if (code === 'USER_NOT_FOUND' || status === 404) setErr('Chưa có tài khoản');
      else if (code === 'WEAK_PASSWORD') setErr(msg || 'Mật khẩu chưa đạt yêu cầu');
      else setErr(msg || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    try {
      const data = await authService.login('demo@company.com', 'demo123');
      localStorage.setItem('auth', JSON.stringify(data));
      nav('/', { replace: true });
    } catch {
      setErr('Không thể đăng nhập tài khoản demo');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5 col-md-7">
        <div className="card p-4">
          <h4 className="mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-box-arrow-in-right text-primary"></i> Đăng nhập
          </h4>
          {flash && <div className="alert alert-success py-2">{flash}</div>}
          {err && <div className="alert alert-danger py-2">{err}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="you@company.com"
                     value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Mật khẩu</label>
              <input className="form-control" type="password" placeholder="••••••"
                     value={password} onChange={(e)=>setPassword(e.target.value)} />
              <div className="form-text">Tối thiểu 6 ký tự, gồm cả chữ và số.</div>
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng nhập...</>
                        : <>Đăng nhập</>}
            </button>
          </form>

          <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={loginAsDemo}>
            Dùng tài khoản khách
          </button>

          <div className="text-center mt-3">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </div>
      </div>
    </div>
  );
}