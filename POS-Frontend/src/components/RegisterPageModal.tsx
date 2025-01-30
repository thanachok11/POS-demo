// RegisterModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, handleGoogleRegister } from '../api/auth.ts'; // Import ฟังก์ชัน API
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../styles/auth/RegisterModal.css';

interface RegisterProps {
  isVisible: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterProps> = ({ isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError('คุณต้องยอมรับเงื่อนไขก่อนสมัครสมาชิก');
      setSuccessMessage('');
      return;
    }

    try {
      const data = await registerUser(formData.email, formData.password, formData.username, formData.firstName, formData.lastName);
      setSuccessMessage('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
      setError('');

      setTimeout(() => {
        onClose();
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setSuccessMessage('');
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    console.log('Google Register Success:', response);

    try {
      const data = await handleGoogleRegister(response.credential);

      if (data.token) {
        console.log('Token saved:', data.token);

        // ตั้งค่าข้อความสำเร็จ
        setSuccessMessage('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
        setError('');

        // ปิด Modal และเปลี่ยนหน้าไปยัง Login
        setTimeout(() => {
          onClose();
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Google Register Error:', error);

      // อัปเดต error message
      const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setError(errorMessage);
      setSuccessMessage('');
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google Register Failed");
    setError("การลงทะเบียนด้วย Google ล้มเหลว กรุณาลองใหม่");
  };


  return (
    <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={onClose} className="close-button">X</button>
          <form onSubmit={handleRegister} className="form">
            <h1 className="title-register">สมัครสมาชิก</h1>
            <input
              type="text"
              name="username"
              placeholder="ชื่อผู้ใช้"
              value={formData.username}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="ชื่อ"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="นามสกุล"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              required
            />
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={handleCheckboxChange}
              />
              <label className="label" htmlFor="acceptTerms">
                ฉันยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว
              </label>
            </div>
            <button type="submit" className="button">สมัครสมาชิก</button>


            {/* เพิ่มปุ่ม Google Register */}
            <div className="google-register-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error("Google Register Failed")}
              />
              {/* แสดงข้อความแจ้งเตือนหากมี error */}
              {error && <p className="error">{error}</p>}
              {successMessage && <p className="success">{successMessage}</p>}
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default RegisterModal;