import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/backend";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const result = await register({ name, email, password });
      // Sau khi đăng ký thành công, chuyển đến trang chủ
      if (result.access_token) {
        navigate("/books");
      } else {
        setError("Đăng ký thành công nhưng không nhận được token");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng ký thất bại";
      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-page">
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(30, 41, 59, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "32px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div className="brand-icon" style={{ margin: "0 auto 16px", width: "64px", height: "64px", fontSize: "32px" }}>
              📘
            </div>
            <h1 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 800, margin: "0 0 8px" }}>
              BookClub
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Tạo tài khoản mới
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px"
              }}>
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="search-input"
                placeholder="Nhập họ và tên"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "15px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px"
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="search-input"
                placeholder="Nhập email của bạn"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "15px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px"
              }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="search-input"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "15px"
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px"
              }}>
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="search-input"
                placeholder="Nhập lại mật khẩu"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "15px"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "16px"
              }}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#13a4ec",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

