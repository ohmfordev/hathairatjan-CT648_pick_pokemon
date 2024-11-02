import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/images/p_13.jpg"; // นำเข้าภาพพื้นหลัง
import loadingSound from "../assets/sounds/loadingSound.mp3"; // เสียงพื้นหลัง

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await axios.post(
          "http://13.215.67.233:3001/api/login",
          {
            user_name: username,
            pass: password,
          }
        );

        if (response.data.success) {
          alert("Login successful!");
          onLogin(response.data.username);
          navigate("/game");
          localStorage.setItem("userId", response.data.user_id);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred during login. Please try again.");
      }
    } else {
      alert("Please enter both username and password");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <audio autoPlay loop>
        <source src={loadingSound} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <h1 className="welcome-message"> Welcome to the Gashapon Machine!</h1>

      <h1
        style={{
          fontSize: "4rem",
          marginBottom: "20px",
          color: "#FFD700",
          textShadow: "2px 2px 5px rgba(255, 169, 20, 0.3)", // เงาให้กับข้อความ
          textAlign: "center", // จัดข้อความให้อยู่กลาง
        }}
      >
        Login
      </h1>
      <input
        type="text"
        placeholder="Enter username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          fontSize: "1.5rem",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "2px solid #ccc",
          width: "300px",
        }}
      />
      <input
        type="password"
        placeholder="Enter password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          fontSize: "1.5rem",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "2px solid #ccc",
          width: "300px",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          fontSize: "1.5rem",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "white",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Login
      </button>
      <button
        onClick={handleRegisterRedirect}
        style={{
          fontSize: "1.2rem",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007BFF",
          color: "white",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        ยังไม่มีบัญชี? ลงทะเบียนที่นี่
      </button>
    </div>
  );
};

export default Login;
