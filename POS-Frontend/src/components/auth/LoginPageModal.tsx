import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { googleLogin, loginUser } from "../../api/auth/auth.ts";
import "../../styles/auth/LoginPageModal.css";

interface LoginProps {
  isVisible: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  if (!isVisible) return null;

  // ฟังก์ชันจัดการล็อกอินด้วยอีเมลและรหัสผ่าน
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);

      setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันจัดการล็อกอินผ่าน Google
  const handleGoogleSuccess = async (response: any) => {
    setError("");
    setSuccessMessage("");

    try {
      // รับ googleToken จาก response
      const googleToken = response.credential;

      const data = await googleLogin(googleToken); // เรียกใช้ฟังก์ชัน googleLogin จาก auth.ts
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", response.credential || "");

      setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">
          X
        </button>
        <form onSubmit={handleLogin} className="form">
          <h1 className="logintitle">เข้าสู่ระบบ</h1>
          <input
            type="email"
            name="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label className="label" htmlFor="rememberMe">
              จดจำฉัน
            </label>
          </div>
          <button type="submit" className="button">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="google-login-container">
          <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess} // ใช้ handleGoogleSuccess
              onError={() => console.error("Google Login Failed")}
              theme="outline"
              size="large"
              text="signin_with"
            />
          </GoogleOAuthProvider>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
