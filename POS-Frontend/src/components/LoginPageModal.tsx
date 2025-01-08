import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth.ts';
import '../styles/auth/LoginPageModal.css';

interface LoginProps {
  isVisible: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    try {
      const data = await loginUser(email, password);
  
      // เก็บ Token และ Email ลง LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
  
      // แสดงข้อความสำเร็จ
      setSuccessMessage('เข้าสู่ระบบสำเร็จ!');
      // หน่วงเวลาเล็กน้อยก่อนรีเฟรชหน้า
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // รีเฟรชหน้า
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">X</button>
        <form onSubmit={handleLogin} className="form">
          <h1 className="title">เข้าสู่ระบบ</h1>
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
            <label className="label" htmlFor="rememberMe">จดจำฉัน</label>
          </div>
          <button type="submit" className="button">เข้าสู่ระบบ</button>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
