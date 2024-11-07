import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate สำหรับการนำทาง
import "./Collection.css"; // นำเข้าไฟล์ CSS

interface Pokemon {
  pok_name: string;
  poke_type_card: string;
  image: string;
}

const Collection: React.FC = () => {
  const [collection, setCollection] = useState<Pokemon[]>([]);
  const navigate = useNavigate(); // ใช้สำหรับการนำทาง

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const userId = localStorage.getItem("userId"); // สมมติว่าเก็บ userId ใน localStorage
        const response = await axios.get(
          `http://13.215.67.233:3001/api/user-collection?user_id=${userId}`
        );
        setCollection(response.data);
      } catch (error) {
        console.error("Error fetching user collection:", error);
      }
    };

    fetchCollection();
  }, []);

  return (
    <div className="collection-container">
      <table className="collection-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {collection.map((pokemon, index) => (
            <tr key={index}>
              <td>{pokemon.pok_name}</td>
              <td>{pokemon.poke_type_card}</td> {/* ใช้ poke_type_card */}
              <td>
                {pokemon.image ? (
                  <img src={pokemon.image} alt={pokemon.pok_name} width="50" />
                ) : (
                  "No Image"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ปุ่มกลับไปหน้าเกม */}
      <button className="back-button" onClick={() => navigate("/game")}>
        Back to Game
      </button>
    </div>
  );
};

export default Collection;
