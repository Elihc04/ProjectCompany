// server/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5050;


const origins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(express.json());


const normalizeEmail = (e) => (e || '').toLowerCase().trim();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const isStrongPassword = (s) => /[A-Za-z]/.test(s || '') && /\d/.test(s || '') && (s || '').length >= 6;
const genToken = () => 'mock-' + crypto.randomUUID();
const genCode6 = () => Math.floor(100000 + Math.random() * 900000).toString();
const now = () => Date.now();


let users = [
  { id: 1, email: 'demo@company.com', name: 'Demo User', password: 'demo123' } // chữ + số, >=6
];


const OTP_TTL_MS = 5 * 60 * 1000;    
const RESEND_COOLDOWN_MS = 30 * 1000; 

const registerOtpStore = new Map();

const registerTickets = new Map();


app.get('/api/ping', (_req, res) => res.json({ ok: true }));


app.post('/api/auth/register/start', (req, res) => {
  try {
    const name = (req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || '';

    if (!name) return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập' });
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    if (!password) return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Mật khẩu phải tối thiểu 6 ký tự và gồm cả chữ lẫn số' });
    }

    const emailTaken = users.some(u => u.email.toLowerCase() === email);
    if (emailTaken) return res.status(409).json({ code: 'EMAIL_TAKEN', message: 'Email đã tồn tại' });

    const nameTaken = users.some(u => (u.name || '').toLowerCase() === name.toLowerCase());
    if (nameTaken) return res.status(409).json({ code: 'NAME_TAKEN', message: 'Tên đăng nhập đã tồn tại' });

    const prev = registerOtpStore.get(email);
    if (prev && prev.lastSentAt && now() - prev.lastSentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now() - prev.lastSentAt)) / 1000);
      return res.status(429).json({ message: `Vui lòng thử lại sau ${wait}s` });
    }

    const code = genCode6();
    registerOtpStore.set(email, {
      code,
      expiresAt: now() + OTP_TTL_MS,
      lastSentAt: now(),
      attemptsLeft: 5
    });

    console.log(`[MOCK EMAIL] Gửi OTP đăng ký tới ${email}: ${code} (hết hạn 30 giây)`);

    return res.json({ ok: true, cooldown: 30 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Không thể gửi mã' });
  }
});

app.post('/api/auth/register/verify', (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = (req.body?.code || '').trim();

    const entry = registerOtpStore.get(email);
    if (!entry) return res.status(400).json({ message: 'Mã không tồn tại. Vui lòng gửi lại.' });
    if (now() > entry.expiresAt) {
      registerOtpStore.delete(email);
      return res.status(400).json({ message: 'Mã đã hết hạn. Vui lòng gửi lại.' });
    }
    if (entry.attemptsLeft <= 0) {
      registerOtpStore.delete(email);
      return res.status(400).json({ message: 'Nhập sai quá số lần cho phép.' });
    }
    if (code !== entry.code) {
      entry.attemptsLeft -= 1;
      registerOtpStore.set(email, entry);
      return res.status(400).json({ message: 'Mã không đúng. Vui lòng kiểm tra lại.' });
    }

    // OTP đúng: phát ticket đăng ký
    registerOtpStore.delete(email);
    // Nếu đã có user thì không cần tạo mới
    const exists = users.some(u => u.email.toLowerCase() === email);
    if (exists) return res.json({ needSignup: false });

    const ticket = 'reg_' + crypto.randomUUID();
    registerTickets.set(ticket, { email, expiresAt: now() + 10 * 60 * 1000 });
    return res.json({ needSignup: true, ticket });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Xác thực thất bại' });
  }
});

// 3) Register: complete (create user)
app.post('/api/auth/register/complete', (req, res) => {
  try {
    const { ticket, name, password } = req.body || {};
    if (!ticket) return res.status(400).json({ message: 'Thiếu ticket' });
    if (!name || !password) return res.status(400).json({ message: 'Thiếu thông tin' });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Mật khẩu phải tối thiểu 6 ký tự và gồm cả chữ lẫn số' });
    }

    const record = registerTickets.get(ticket);
    if (!record) return res.status(400).json({ message: 'Ticket không hợp lệ hoặc đã hết hạn' });
    if (now() > record.expiresAt) {
      registerTickets.delete(ticket);
      return res.status(400).json({ message: 'Ticket đã hết hạn' });
    }

    const email = normalizeEmail(record.email);
    if (users.some(u => u.email.toLowerCase() === email)) {
      registerTickets.delete(ticket);
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const nameRaw = (name || '').trim();
    if (users.some(u => (u.name || '').toLowerCase() === nameRaw.toLowerCase())) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const newUser = { id: users.length + 1, email, name: nameRaw, password }; 
    users.push(newUser);
    registerTickets.delete(ticket);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Không thể tạo tài khoản' });
  }
});

// Login (mock)
app.post('/api/auth/login', (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).json({ code: 'MISSING_FIELDS', message: 'Thiếu email hoặc mật khẩu' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ code: 'WEAK_PASSWORD', message: 'Mật khẩu phải tối thiểu 6 ký tự và gồm cả chữ lẫn số' });
    }

    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'Chưa có tài khoản' });
    }

    if (user.password !== password) {
      return res.status(401).json({ code: 'INVALID_PASSWORD', message: 'Đăng nhập không thành công. Mật khẩu không hợp lệ' });
    }

    const token = genToken();
    return res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Đăng nhập thất bại' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock Auth + OTP API listening on http://localhost:${PORT}`);
  console.log('Demo account: demo@company.com / demo123');
});