👩‍💻 Người thực hiện
Thành viên: Nguyễn Dương Lệ Chi
Nhiệm vụ: Thiết kế giao diện đăng nhập & đăng ký
Công nghệ: React, Bootstrap, HTML, CSS, JavaScript (Auth giả lập)

# Auth + OTP Mock — React + Bootstrap + Node/Express
Giao diện đăng nhập/đăng ký kèm OTP gửi email (mô phỏng). Backend giả lập (in-memory) — không dùng DB/SMTP thật. OTP được “gửi” bằng cách in ra console của server.

## ✨ Tính năng
- Đăng ký qua OTP (mô phỏng gửi email, TTL 5 phút, cooldown 30 giây)
- Đăng nhập (token giả)
- Ràng buộc mật khẩu: tối thiểu 6 ký tự, gồm cả chữ và số
- UI dùng Bootstrap + Bootstrap Icons
- Lưu trạng thái đăng nhập trong localStorage

## 🧱 Công nghệ
- Frontend: React, React Router, Axios, Bootstrap, Bootstrap Icons
- Backend: Node.js, Express, CORS, dotenv
- Lưu trữ: In-memory (không DB)

## 📁 Cấu trúc thư mục
.
├─ server/
│ └─ index.js 
└─ client/
├─ index.html
└─ src/
├─ main.jsx
├─ App.jsx
├─ api/axios.js
├─ services/auth.service.js
└─ pages/
├─ Home.jsx
├─ Login.jsx
└─ Register.jsx

## ✅ Yêu cầu
- Node.js 18+ và npm
- Cổng trống: 5050 (server), 5173 (client)

## 🚀 Cách chạy
1) Clone dự án
```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>

2) Backend (server)
Bash
cd server
npm install  # nếu chưa có package.json, cài tối thiểu: npm i express cors dotenv
# (tùy chọn) file .env
# PORT=5050
# ALLOWED_ORIGIN=http://localhost:5173
node index.js
# Server: http://localhost:5050
# Kiểm tra: http://localhost:5050/api/ping -> {"ok":true}

3) Frontend (client)
Mở terminal mới:
Bash
cd client
npm install  # cài deps của Vite/React (nếu repo đã có package.json)
# (tùy chọn) client/.env
# VITE_API_URL=http://localhost:5050
npm run dev
# FE: http://localhost:5173

🔐 Tài khoản mẫu
Email: demo@company.com
Mật khẩu: demo123
Hoặc tự đăng ký email của bạn (mật khẩu phải có chữ + số, tối thiểu 6 ký tự).

🔄 Luồng đăng ký OTP (mô phỏng)
Ở trang Đăng ký: nhập Tên, Email, Mật khẩu → bấm “Gửi mã OTP”
Server in OTP ra console (dòng: [MOCK EMAIL] Gửi OTP đăng ký tới ...: 123456)
Nhập OTP 6 số trên UI → Xác nhận
Tạo tài khoản thành công → chuyển sang Đăng nhập
