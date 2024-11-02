import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Game.css"; // นำเข้าไฟล์ CSS
import backgroundImage from "../assets/images/Group1.png";
import PokemonEgg from "../assets/images/Pokemon.jpg";
import loadingSound from "../assets/sounds/loadingSound.mp3";
import gashaponMachine from "../assets/images/gashaponMachine.png";
import hoverSound from "../assets/sounds/hoverSound.mp3";
import { useNavigate } from "react-router-dom";

interface GameProps {
  username: string;
  onLogout: () => void;
}

interface PokemonCard {
  id: number;
  name: string;
  type: string;
  hp_base: number;
  attack_base: number;
  defense_base: number;
  image: string;
}

const Game: React.FC<GameProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [isCracking, setIsCracking] = useState<boolean>(false);
  const [randomCard, setRandomCard] = useState<PokemonCard | null>(null);
  const [showPokemon, setShowPokemon] = useState<boolean>(false);
  const [history, setHistory] = useState<PokemonCard[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string | null }>({ id: null });
  const [dropRates, setDropRates] = useState<{ [key: string]: number }>({});
  const [consecutivePulls, setConsecutivePulls] = useState<number>(0);
  const [powerUpPoints, setPowerUpPoints] = useState<number>(0); // เพิ่มสถานะสำหรับเก็บคะแนน power-up

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://13.215.67.233:3001/api/user?username=${username}`
        );
        setUser({ id: response.data.user_id });
        setConsecutivePulls(response.data.consecutive_pulls);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchDropRates = async () => {
      try {
        const response = await axios.get(
          "http://13.215.67.233:3001/api/drop-rates"
        );
        setDropRates(response.data);
      } catch (error) {
        console.error("Error fetching drop rates:", error);
      }
    };

    fetchUserData();
    fetchDropRates();
  }, [username]);

  // ฟังก์ชันเริ่มเกม
  const handleMachineClick = () => {
    setIsGameStarted(true);
    setTimeout(() => setIsCracking(false), 500);
  };

  // ฟังก์ชันเมื่อคลิกที่ไข่
  const handleEggClick = async () => {
    if (isCracking || !user.id) return;

    setIsCracking(true);
    try {
      const response = await axios.get(
        `http://13.215.67.233:3001/api/random-pokemon?user_id=${user.id}`
      );
      console.log("API Response:", response.data);
      if (response.data && response.data.pok_name) {
        const randomPokemon: PokemonCard = {
          id: response.data.pok_id,
          name: response.data.pok_name.trim(),
          type: response.data.poke_type.trim(),
          hp_base: response.data.hp_base,
          attack_base: response.data.attack_base,
          defense_base: response.data.defense_base,
          image: response.data.image,
        };
        setTimeout(() => {
          setRandomCard(randomPokemon);
          setHistory((prevHistory) => [...prevHistory, randomPokemon]);
          setShowPokemon(true);
          setIsCracking(false);
          setConsecutivePulls((prev) => prev + 1);
          handlePokemonObtained(randomPokemon.id);
        }, 3000);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Error fetching random Pokemon:", error);
      alert("Failed to fetch Pokemon. Please try again.");
      setIsCracking(false);
    }
  };

  // ฟังก์ชันจัดการเมื่อได้รับ Pokemon
  const handlePokemonObtained = async (pokemonId: number) => {
    if (!user.id) {
      console.error("User ID is not available");
      return;
    }
    try {
      const response = await axios.post(
        "http://13.215.67.233:3001/api/duplicate-pokemon",
        {
          userId: user.id,
          pokemonId: pokemonId,
        }
      );
      alert(response.data.message);

      // ดึงข้อมูลคะแนน power-up ใหม่
      const pointsResponse = await axios.get(
        `http://13.215.67.233:3001/api/user-pokemon-points?user_id=${user.id}&pokemon_id=${pokemonId}`
      );
      setPowerUpPoints(pointsResponse.data.power_up_points);
    } catch (error) {
      console.error("Error handling obtained Pokemon:", error);
    }
  };

  // ฟังก์ชันล้างข้อมูล Pokemon ที่แสดง
  const handleClear = () => {
    setRandomCard(null);
    setShowPokemon(false);
    setIsGameStarted(false);
    setPowerUpPoints(0); // รีเซ็ตคะแนน power-up เมื่อเคลียร์ข้อมูล
  };

  // ฟังก์ชันสลับการแสดงโมดัลประวัติ
  const toggleHistoryModal = () => {
    setShowHistoryModal(!showHistoryModal);
  };

  // ฟังก์ชันเล่นเสียงเมื่อเมาส์ hover
  const playHoverSound = () => {
    const audio = new Audio(hoverSound);
    audio.play();
  };

  return (
    <div
      className="game-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="header-buttons">
        <button
          className="collection-button"
          onClick={() => navigate("/collection")}
        >
          {" "}
          View Collection
        </button>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
      {!isGameStarted ? (
        <div
          className="start-container"
          onClick={handleMachineClick}
          onMouseEnter={playHoverSound}
        >
          <h1 className="welcome-message">
            Welcome {username} to the Gashapon Machine!
          </h1>
          <img
            src={gashaponMachine}
            alt="Gashapon Machine"
            className="gashapon-image"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
      ) : (
        <>
          {!showPokemon && (
            <div className="egg-grid">
              <div
                className={`egg ${isCracking ? "cracking" : ""}`}
                onClick={handleEggClick}
              >
                <img
                  src={PokemonEgg}
                  alt="Pokémon Egg"
                  className={`egg-image ${isGameStarted ? "zoom-in" : ""}`}
                />
              </div>
            </div>
          )}

          {showPokemon && randomCard && (
            <div
              className={`pokemon-modal zoom-out ${
                randomCard.type === "rare" ? "rare-card" : ""
              }`}
            >
              <h2>{randomCard.name}</h2>
              {randomCard.image ? (
                <img
                  src={randomCard.image}
                  alt={randomCard.name}
                  className="pokemon-image"
                />
              ) : (
                <div>No image available</div>
              )}
              <p>Type: {randomCard.type}</p>
              <p>HP: {randomCard.hp_base}</p>
              <p>Attack: {randomCard.attack_base}</p>
              <p>Defense: {randomCard.defense_base}</p>
              <button className="clear-button" onClick={handleClear}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <div className="drop-rates">
            <h3>Drop Rates:</h3>
            {Object.entries(dropRates).map(([type, rate]) => (
              <p key={type}>
                {type}: {rate}%
              </p>
            ))}
            <p>Power-up Points for this Pokémon: {powerUpPoints}</p>
          </div>

          {/* แสดงคะแนน power-up */}
          {/* <div className="power-up-points">
            <p>Power-up Points for this Pokémon: {powerUpPoints}</p>
          </div> */}

          <div className="consecutive-pulls">
            <p>Consecutive Pulls: {consecutivePulls}</p>
          </div>
        </>
      )}
      <audio autoPlay loop>
        <source src={loadingSound} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Game;
