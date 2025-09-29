import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { googleLogin, loginUser } from "../../api/auth/auth";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  const [isClosing, setIsClosing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      // เช็ค role และทำการเปลี่ยนเส้นทางตาม role
      if (data.role === "employee") {
        navigate("/employee-dashboard"); // เปลี่ยนเส้นทางไปหน้าพนักงาน
      } else {
        navigate("/"); // ถ้าไม่ใช่พนักงานไปหน้าหลัก
      }

      setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
      setTimeout(() => {
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

      // เช็ค role และทำการเปลี่ยนเส้นทางตาม role
      if (data.role === "employee") {
        navigate("/employee-dashboard"); // เปลี่ยนเส้นทางไปหน้าพนักงาน
      } else {
        navigate("/"); // ถ้าไม่ใช่พนักงานไปหน้าหลัก
      }

      setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };
  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }; const handleForgotPassword = () => {
    onClose(); // ปิด modal ก่อน
    navigate("/forgot-password");
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <div className={`login-modal ${isClosing ? 'slide-out' : 'slide-in'}`}>
          <button onClick={handleClose} className="login-close-button">×</button>
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">เข้าสู่ระบบ</h2>
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
            <input
              type={showPassword ? "text" : "password"} // สลับ type
              name="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>

            <div className="login-checkbox-container">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe" className="login-label">
                จดจำฉัน
              </label>
            </div>
            <button type="submit" className="login-button">เข้าสู่ระบบ</button>
          </form>
        </div>


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
          {error && <p className="login-error">{error}</p>}
          {successMessage && <p className="login-success">{successMessage}</p>}
        </div>
        <p
          className="login-forgot"
          onClick={handleForgotPassword}
        >
          ลืมรหัสผ่าน?
        </p>
      </div>
      </div>
  );
};

export default Login;
