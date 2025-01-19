import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GoogleRegister: React.FC = () => {
  const handleGoogleSuccess = async (response: any) => {
    console.log("Google Register Success:", response);

    // ส่ง Google Token ไปที่ Backend เพื่อสมัครสมาชิก
    fetch("http://localhost:5000/api/auth/google-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleToken: response.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Register Response:", data);
        if (data.token) {
          localStorage.setItem("authToken", data.token); // 👉 เก็บ Token ไว้ใน Local Storage
        }
      })
      .catch((error) => console.error("Register Error:", error));
  };

  return (
    <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
      <div className="google-register-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Google Register Failed")}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleRegister;
