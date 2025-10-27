import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const isPwComplex = (pw) => /[A-Za-z]/.test(pw || '') && /\d/.test(pw || '') && (pw || '').length >= 6;
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

export default function Register() {
  const [step, setStep] = useState('info'); // info -> otp -> done
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [otp, setOtp] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const COOLDOWN_SEC = 30;
  const nav = useNavigate();

  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const start = async () => {
    setErr(''); setMsg('');
    if (!name.trim()) return setErr('Vui lòng nhập tên đăng nhập');
    if (!email.trim()) return setErr('Vui lòng nhập email');
    if (!isEmail(email)) return setErr('Email không hợp lệ');
    if (!pw1) return setErr('Vui lòng nhập mật khẩu');
    if (!isPwComplex(pw1)) return setErr('Mật khẩu phải tối thiểu 6 ký tự, gồm cả chữ và số');
    if (pw1 !== pw2) return setErr('Mật khẩu xác nhận không khớp');

    setLoading(true);
    try {
      const data = await authService.registerStart({ name, email, password: pw1 });
      setStep('otp');
      setMsg('Đã gửi OTP (mô phỏng). Vui lòng kiểm tra console server để lấy mã. Hộp thư/Spam (nếu có).');
      setResendCooldown(COOLDOWN_SEC);
    } catch (ex) {
      const status = ex?.response?.status;
      const code = ex?.response?.data?.code;
      const m = ex?.response?.data?.message;
      if (status === 409 && code === 'EMAIL_TAKEN') setErr('Email đã tồn tại');
      else if (status === 409 && code === 'NAME_TAKEN') setErr('Tên đăng nhập đã tồn tại');
      else if (status === 429) setErr(m || 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.');
      else setErr(m || 'Không thể gửi mã');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setErr(''); setMsg('');
    try {
      await authService.registerStart({ name, email, password: pw1 });
      setMsg('Đã gửi lại mã OTP.');
      setResendCooldown(COOLDOWN_SEC);
    } catch (ex) {
      const m = ex?.response?.data?.message;
      setErr(m || 'Không thể gửi lại mã');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndComplete = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if ((otp || '').trim().length !== 6) return setErr('Mã gồm 6 số');

    setLoading(true);
    try {
      const verified = await authService.registerVerify({ email, code: (otp || '').trim() });
      if (verified?.needSignup === false) {
        setMsg('Email đã có tài khoản. Vui lòng đăng nhập.');
        return;
      }
      if (!verified?.ticket) {
        return setErr('Xác thực không hợp lệ hoặc mã đã hết hạn. Vui lòng gửi lại mã.');
      }

      const done = await authService.registerComplete({ ticket: verified.ticket, name, password: pw1 });
      if (done?.ok) {
        setStep('done');
        setMsg('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      } else {
        setErr('Không thể tạo tài khoản. Vui lòng thử lại.');
      }
    } catch (ex) {
      const m = ex?.response?.data?.message;
      setErr(m || 'Không thể xác thực/đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5 col-md-7">
        <div className="card p-4">
          <h4 className="mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-person-plus text-primary"></i> Đăng ký (OTP)
          </h4>
          {msg && <div className="alert alert-success py-2">{msg}</div>}
          {err && <div className="alert alert-danger py-2">{err}</div>}

          {step === 'info' && (
            <div>
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

              <button className="btn btn-primary w-100" disabled={loading} onClick={start}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi mã...</>
                         : <>Gửi mã OTP</>}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyAndComplete} autoComplete="off">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={email} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Mã xác nhận (6 số)</label>
                <input
                  className="form-control"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e)=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="Nhập mã 6 số"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light flex-fill"
                        onClick={()=>{ setStep('info'); setMsg(''); setErr(''); }} disabled={loading}>
                  <i className="bi bi-chevron-left me-1"></i>Quay lại
                </button>
                <button className="btn btn-success flex-fill" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xác thực & tạo tài khoản...</>
                           : <>Xác nhận</>}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-link mt-2 p-0"
                onClick={resend}
                disabled={resendCooldown > 0 || loading}
              >
                Gửi lại mã {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="alert alert-success">Đăng ký thành công!</div>
              <button className="btn btn-primary"
                      onClick={()=>nav('/login', { state: { flash: 'Đăng ký thành công. Mời bạn đăng nhập.' } })}>
                Đăng nhập
              </button>
            </div>
          )}

          <div className="text-center mt-3">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}