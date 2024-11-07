import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Game.css";
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
  const [powerUpPoints, setPowerUpPoints] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5); // ตั้งค่าเริ่มต้นเสียงกลาง
  const [backgroundAudio] = useState(new Audio(loadingSound));

  useEffect(() => {
    backgroundAudio.loop = true;
    backgroundAudio.volume = isMuted ? 0 : volume;
    if (isGameStarted && !isMuted) {
      backgroundAudio.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
    } else {
      backgroundAudio.pause();
    }
  }, [isGameStarted, isMuted, volume, backgroundAudio]);

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

    return () => {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    };
  }, [username, backgroundAudio]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true); // ปิดเสียงถ้าเลื่อนลงไปที่ 0
    } else {
      setIsMuted(false); // เปิดเสียงถ้าเลื่อนขึ้นมาอีกครั้ง
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return "🔇"; // ปิดเสียง
    if (volume > 0.5) return "🔊"; // เสียงดัง
    return "🔉"; // เสียงเบา
  };

  const handleMachineClick = () => {
    setIsGameStarted(true);
    setTimeout(() => setIsCracking(false), 500);
  };

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

      const pointsResponse = await axios.get(
        `http://13.215.67.233:3001/api/user-pokemon-points?user_id=${user.id}&pokemon_id=${pokemonId}`
      );
      setPowerUpPoints(pointsResponse.data.power_up_points);
    } catch (error) {
      console.error("Error handling obtained Pokemon:", error);
    }
  };

  const handleClear = () => {
    setRandomCard(null);
    setShowPokemon(false);
    setIsGameStarted(false);
    setPowerUpPoints(0);
  };

  const toggleHistoryModal = () => {
    setShowHistoryModal(!showHistoryModal);
  };

  const playHoverSound = () => {
    if (!isMuted) {
      const audio = new Audio(hoverSound);
      audio.play();
    }
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

          <div className="consecutive-pulls">
            <p>Consecutive Pulls: {consecutivePulls}</p>
          </div>
        </>
      )}
      <div className="volume-control_game">
        <span
          onClick={toggleMute}
          style={{ cursor: "pointer", fontSize: "24px" }}
        >
          {getVolumeIcon()}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          disabled={isMuted}
          style={{
            width: "100px",
            cursor: "pointer",
            appearance: "none",
            backgroundColor: "#ddd",
            height: "10px",
            borderRadius: "5px",
          }}
        />
        <span>{Math.round(volume * 100)}%</span> {/* แสดงเปอร์เซ็นต์ของเสียง */}
        <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
      </div>
    </div>
  );
};

export default Game;
