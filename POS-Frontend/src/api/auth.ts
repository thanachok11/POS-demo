// services/auth.ts
import axios from 'axios';

// กำหนด URL ของ API
export const API_URL = 'http://localhost:5000/api/auth';  // ปรับ URL ตามที่คุณกำหนดใน backend

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้ใหม่
export const registerUser = async (email: string, password: string, username: string, firstName: string, lastName: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      username,
      firstName,
      lastName
    });

    return response.data;  // ส่งข้อมูลที่ได้รับจาก API
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};
// auth.ts
export const handleGoogleRegister = async (googleToken: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/google-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken }),
    });

    const data = await response.json();
    console.log('Register Response:', data);

    if (data.token) {
      localStorage.setItem('authToken', data.token); // เก็บ Token ไว้ใน Local Storage
    }

    return data;
  } catch (error) {
    console.error('Register Error:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับการล็อกอินผู้ใช้
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });

    return response.data;  // ส่งข้อมูลที่ได้รับจาก API
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// auth.ts

export const googleLogin = async (googleToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/google-login`, {
      googleToken
    });

    return response.data;  // ส่งข้อมูลที่ได้รับจาก API
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
