import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const isPwComplex = (pw) => /[A-Za-z]/.test(pw || '') && /\d/.test(pw || '') && (pw || '').length >= 6;
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');

    if (!name.trim()) return setErr('Vui lòng nhập tên đăng nhập');
    if (!email.trim()) return setErr('Vui lòng nhập email');
    if (!isEmail(email)) return setErr('Email không hợp lệ');
    if (!pw1) return setErr('Vui lòng nhập mật khẩu');
    if (!isPwComplex(pw1)) return setErr('Mật khẩu phải tối thiểu 6 ký tự, gồm cả chữ và số');
    if (pw1 !== pw2) return setErr('Mật khẩu xác nhận không khớp');

    setLoading(true);
    try {
      const res = await authService.register({ name, email, password: pw1 });
      if (res?.ok) {
        setMsg('Đăng ký thành công!'); 
        setTimeout(() => nav('/login', { state: { flash: 'Đăng ký thành công. Mời bạn đăng nhập.' } }), 800);
      }
    } catch (ex) {
      const status = ex?.response?.status;
      const code = ex?.response?.data?.code;
      const m = ex?.response?.data?.message;
      if (status === 409 && code === 'EMAIL_TAKEN') setErr('Email đã tồn tại');
      else if (status === 409 && code === 'NAME_TAKEN') setErr('Tên đăng nhập đã tồn tại');
      else setErr(m || 'Không thể đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5 col-md-7">
        <div className="card p-4">
          <h4 className="mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-person-plus text-primary"></i> Đăng ký
          </h4>
          {msg && <div className="alert alert-success py-2">{msg}</div>}
          {err && <div className="alert alert-danger py-2">{err}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Tên đăng nhập</label>
              <input className="form-control" placeholder="username"
                     value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="you@company.com"
                     value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
              <input className="form-control" type="password" placeholder="••••••"
                     value={pw1} onChange={(e)=>setPw1(e.target.value)} />
              <div className="form-text">Tối thiểu 6 ký tự, gồm cả chữ và số.</div>
            </div>
            <div className="mb-2">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input className="form-control" type="password" placeholder="Nhập lại mật khẩu"
                     value={pw2} onChange={(e)=>setPw2(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang tạo tài khoản...</>
                        : <>Đăng ký</>}
            </button>
          </form>

          <div className="text-center mt-3">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}