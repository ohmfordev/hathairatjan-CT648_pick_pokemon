// src/pages/Home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/images/p_122.jpg";
import loadingSound from "../assets/sounds/loadingSound.mp3";

interface HomeProps {
  onLogin: (user: string | null) => void;
}

const Home: React.FC<HomeProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate(); // ใช้ useNavigate ภายในคอมโพเนนต์ Home

  const handleLogin = () => {
    if (username) {
      console.log(`Logging in as: ${username}`);
      onLogin(username);
      navigate("/game"); // นำทางไปยังเกมหลังจากล็อกอิน
    }
  };

  const handleRegisterClick = () => {
    navigate("/register"); // ใช้ navigate เพื่อไปยังหน้า register
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
      {/* แท็ก audio สำหรับเล่นเพลง */}
      <audio autoPlay loop>
        <source src={loadingSound} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <h1 className="welcome-message">Welcome to the Pokémon Game!</h1>
      <input
        type="text"
        placeholder="Enter username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)} // อัปเดตชื่อผู้ใช้ตาม input
        style={{
          fontSize: "2rem",
          padding: "15px",
          margin: "20px 0",
          borderRadius: "5px",
          border: "2px solid white",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          width: "300px",
        }}
      />
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          style={{
            fontSize: "1.5rem",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            color: "black",
            cursor: "pointer",
            marginRight: "10px",
          }}
          onClick={handleLogin} // เรียกใช้ handleLogin เมื่อคลิก Login
        >
          Login
        </button>
        <button
          style={{
            fontSize: "1.5rem",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            color: "black",
            cursor: "pointer",
          }}
          onClick={handleRegisterClick} // เรียกใช้ handleRegisterClick เมื่อคลิก Register
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Home;
