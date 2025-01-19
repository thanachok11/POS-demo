import React from "react";
import "../../styles/index.css";

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
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
