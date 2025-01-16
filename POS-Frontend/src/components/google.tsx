import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
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
