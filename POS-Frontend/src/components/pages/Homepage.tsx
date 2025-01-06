import React from "react";
import "../../styles/HomePage.css";

const HeroSection = () => {
  return (
    <div className="container">
      <div className="hero">
        <div className="overlay"></div>
        <div className="heroContent">
          <h1 className="title">Welcome to POS System</h1>
          <p className="subtitle">Effortless transactions for your business</p>
          <p className="description">
            Sign up now to streamline your sales, manage inventory, and access insightful reports with ease.
          </p>
          <div className="ctaButtons">
            <button className="signupButton">Sign Up</button>
            <button className="loginButton">Log In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
