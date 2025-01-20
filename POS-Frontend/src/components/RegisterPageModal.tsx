import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, handleGoogleRegister } from '../api/auth.ts';
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
      const data = await registerUser(
        formData.email, 
        formData.password, 
        formData.username, 
        formData.firstName, 
        formData.lastName
      );
      setSuccessMessage('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
      setError('');

      setTimeout(() => {
        onClose();
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Register Error:', err);
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setSuccessMessage('');
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    console.log('Google Register Success:', response);

    try {
      const data = await handleGoogleRegister(response.credential);
      if (!data || !data.token) {
        throw new Error('บัญชี google นี้มีอยู่ในระบบอยู่แล้ว ');
      }

      setSuccessMessage('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
      setError('');

      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Google Register Error:', error);
      setError(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setSuccessMessage('');
    }
  };

  return (
    <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={onClose} className="close-button">X</button>
          <form onSubmit={handleRegister} className="form">
            <h1 className="title-register">สมัครสมาชิก</h1>
            <input type="text" name="username" placeholder="ชื่อผู้ใช้" value={formData.username} onChange={handleChange} className="input" required />
            <input type="email" name="email" placeholder="อีเมล" value={formData.email} onChange={handleChange} className="input" required />
            <input type="password" name="password" placeholder="รหัสผ่าน" value={formData.password} onChange={handleChange} className="input" required />
            <input type="text" name="firstName" placeholder="ชื่อ" value={formData.firstName} onChange={handleChange} className="input" required />
            <input type="text" name="lastName" placeholder="นามสกุล" value={formData.lastName} onChange={handleChange} className="input" required />
            <div className="checkbox-container">
              <input type="checkbox" id="acceptTerms" checked={acceptedTerms} onChange={handleCheckboxChange} />
              <label className="label" htmlFor="acceptTerms">ฉันยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว</label>
            </div>
            <button type="submit" className="button">สมัครสมาชิก</button>

            <div className="google-register-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error("Google Register Failed");
                  setError("เกิดข้อผิดพลาดในการสมัครผ่าน Google กรุณาลองใหม่อีกครั้ง");
                }}
              />
            </div>
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default RegisterModal;
