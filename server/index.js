const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5050;

const origins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(express.json());

const normalizeEmail = (e) => (e || '').toLowerCase().trim();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const isStrongPassword = (s) => /[A-Za-z]/.test(s || '') && /\d/.test(s || '') && (s || '').length >= 6;
const genToken = () => 'mock-' + crypto.randomUUID();

let users = [
  { id: 1, email: 'demo@company.com', name: 'Demo User', password: 'demo123' } // đáp ứng rule
];

app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// Auth: Register (giả lập)
app.post('/api/auth/register', (req, res) => {
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

    const newUser = { id: users.length + 1, email, name, password }; // mock: lưu plaintext
    users.push(newUser);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Không thể đăng ký' });
  }
});

// Auth: Login (giả lập)
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
  console.log(`Mock Auth API listening on http://localhost:${PORT}`);
});