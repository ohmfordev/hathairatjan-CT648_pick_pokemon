import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Game from "./components/Game";
import Register from "./components/Register";
import Loading from "./components/Loading";
import Login from "./components/Login"; // นำเข้า Login
import Collection from "./components/Collection"; // นำเข้า Collection component

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null); // เก็บสถานะผู้ใช้
  const [isLoading, setIsLoading] = useState<boolean>(true); // สถานะโหลดหน้า
  const [progress, setProgress] = useState<number>(0); // แสดงความคืบหน้าการโหลด

  // สร้างสถานะการโหลด
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setIsLoading(false); // หยุดโหลดเมื่อถึง 100%
          return 100;
        }
        return prev + 10; // เพิ่มความคืบหน้าทีละ 10%
      });
    }, 300); // เพิ่มทุก 300ms

    return () => clearInterval(loadingInterval); // ล้าง interval เมื่อ component ถูกทำลาย
  }, []);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    setUser(null); // รีเซ็ตสถานะผู้ใช้
  };

  return (
    <Router>
      {isLoading ? (
        <Loading progress={progress} /> // แสดงหน้าโหลดขณะที่กำลังโหลด
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} /> {/* เปลี่ยนเส้นทางไปยังหน้า Login */}
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/game" element={user ? <Game username={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/register" element={<Register onLogin={setUser} />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;