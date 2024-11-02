// src/api.ts
import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2";

// ฟังก์ชันดึงข้อมูล Pokémon ตามจำนวนที่กำหนด
export const fetchPokemons = async (limit: number = 100) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    throw error;
  }
};

// ฟังก์ชันดึงข้อมูลรายละเอียดของ Pokémon ตามชื่อ
export const fetchPokemonDetails = async (name: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${name}:`, error);
    throw error;
  }
};
