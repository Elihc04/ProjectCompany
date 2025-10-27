
export default function Home() {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  return (
    <div className="text-center">
      <h3 className="mb-3">Trang chủ</h3>
      {auth ? (
        <div className="alert alert-success">
          Đã đăng nhập dưới tên: <b>{auth.user?.name || auth.user?.email}</b>
        </div>
      ) : (
        <div className="alert alert-info">Bạn chưa đăng nhập. Vui lòng chọn Đăng nhập/Đăng ký ở góc phải.</div>
      )}
    </div>
  );
}