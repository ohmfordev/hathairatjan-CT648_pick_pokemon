// src/components/Logout.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Logout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogout = () => {
    onLogout(); // Call the logout function passed as a prop
    navigate("/"); // Navigate back to the home page after logout
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
