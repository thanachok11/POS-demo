import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GoogleLoginComponent: React.FC = () => {
    const handleGoogleSuccess = async (response: any) => {
        console.log("Google Login Success:", response);

        // ส่ง Google Token ไปที่ Backend เพื่อล็อกอิน
        fetch("http://localhost:5000/api/auth/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ googleToken: response.credential }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Login Response:", data);
                if (data.token) {
                    localStorage.setItem("authToken", data.token); // 👉 เก็บ Token ไว้ใน Local Storage
                    alert("เข้าสู่ระบบสำเร็จ!");
                } else {
                    alert(data.message || "เข้าสู่ระบบไม่สำเร็จ!");
                }
            })
            .catch((error) => console.error("Login Error:", error));
    };

    return (
        <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
            <div className="google-login-container">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.error("Google Login Failed")}
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginComponent;
