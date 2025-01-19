import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
<<<<<<< HEAD

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
=======
import axios from "axios";

const App: React.FC = () => {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google/callback", {
        token: credentialResponse.credential, // Access the credential here
      });
      alert(res.data.message); // Show success message
      console.log(res.data.user); // Display user data in console
    } catch (error: any) {
      console.error(error.response?.data?.error || "Something went wrong");
      alert("Registration failed");
    }
  };

  const handleFailure = () => {
    alert("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com">
      <div>
        <h1>Sign up with Google</h1>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
>>>>>>> 53da7cf0ae02369164b1eb52be70513e8700ef81
