import express from 'express';
import { Client } from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  host: '13.215.67.233',
  database: 'postgres',
  user: 'postgres',
  password: '180541',
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

app.get('/', (req, res) => {
  res.send('Welcome to the Pokémon Battle API!');
});

app.get('/api/pokemon', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM pokemon;');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/pic_poke', async (req, res) => {
  try {
    const pok_name = req.query.pok_name;
    const sql = "SELECT pok_image FROM pic_poke WHERE pok_name = $1";
    const result = await client.query(sql, [pok_name]);
    if (result.rows.length > 0) {
      res.send(result.rows[0]['pok_image']);
    } else {
      res.status(404).send('Pokémon not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { user_name, pass } = req.body;
    const sql = "SELECT * FROM user_id WHERE user_name = $1";
    const result = await client.query(sql, [user_name]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(pass, user.pass);
      if (isMatch) {
        res.json({ success: true, user_id: user.user_id, username: user.user_name });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { user_name, pass } = req.body;
    
    const checkUserSql = "SELECT * FROM user_id WHERE user_name = $1";
    const checkResult = await client.query(checkUserSql, [user_name]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const insertSql = "INSERT INTO user_id (user_name, pass, consecutive_pulls) VALUES ($1, $2, 0) RETURNING user_id";
    const insertResult = await client.query(insertSql, [user_name, hashedPassword]);
    
    if (insertResult.rows.length > 0) {
      const newUserId = insertResult.rows[0].user_id;
      res.status(201).json({ success: true, message: 'User registered successfully', user_id: newUserId });
    } else {
      throw new Error('Failed to insert new user');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/user_wl', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const sql = "SELECT * FROM user_wl WHERE user_id = $1";
    const result = await client.query(sql, [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User win/loss data not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/user', async (req, res) => {
  try {
    const username = req.query.username;
    const sql = "SELECT user_id, consecutive_pulls FROM user_id WHERE user_name = $1";
    const result = await client.query(sql, [username]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/random-pokemon', async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // เพิ่มจำนวนครั้งที่สุ่ม
    await client.query('UPDATE user_id SET consecutive_pulls = consecutive_pulls + 1 WHERE user_id = $1', [userId]);

    // ดึงจำนวนครั้งที่สุ่มปัจจุบัน
    const pullsResult = await client.query('SELECT consecutive_pulls FROM user_id WHERE user_id = $1', [userId]);
    
    if (pullsResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const consecutivePulls = pullsResult.rows[0].consecutive_pulls;

    // ตรวจสอบว่ามีโปเกมอนในฐานข้อมูลหรือไม่
    let result;

    // กำหนดให้ได้การ์ด rare ทุกๆ 6 ครั้ง
    if (consecutivePulls % 6 === 0) {
      result = await client.query("SELECT * FROM pokemon WHERE poke_type_card = 'rare' ORDER BY RANDOM() LIMIT 1");
      await client.query('UPDATE user_id SET consecutive_pulls = 0 WHERE user_id = $1', [userId]);
      console.log('Rare card obtained, consecutive pulls reset.');
    } else {
      result = await client.query(`
        SELECT * FROM pokemon 
        WHERE RANDOM() < CASE 
          WHEN poke_type_card = 'rare' THEN 0.1 + ${Math.min(consecutivePulls * 0.5, 20) / 100}
          ELSE 0.9 - ${Math.min(consecutivePulls * 0.5, 20) / 100}
        END
        ORDER BY RANDOM() 
        LIMIT 1
      `);
    }

    // ตรวจสอบว่ามีผลลัพธ์หรือไม่
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No Pokemon found' });
    }

    const randomPokemon = result.rows[0];

    // ดึงรูปภาพของโปเกมอน
    const imageResult = await client.query('SELECT pok_image FROM pic_poke WHERE pok_name = $1', [randomPokemon.pok_name.trim()]);
    
    if (imageResult.rows.length > 0 && imageResult.rows[0].pok_image) {
      randomPokemon.image = `data:image/png;base64,${imageResult.rows[0].pok_image}`;
    } else {
      randomPokemon.image = null;
    }
    
    res.json(randomPokemon);
  } catch (error) {
    console.error('Error fetching random Pokemon:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/update-history', async (req, res) => {
  try {
    const { user_id, result } = req.body;
    const updateSql = `UPDATE user_wl SET ${result} = ${result} + 1 WHERE user_id = $1`;
    await client.query(updateSql, [user_id]);
    res.json({ success: true, message: 'History updated successfully' });
  } catch (error) {
    console.error('Error updating history:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/drop-rates', (req, res) => {
  const dropRates = {
    common: 70,
    uncommon: 20,
    rare: 10
  };
  res.json(dropRates);
});

app.post('/api/duplicate-pokemon', async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;
    
    const checkResult = await client.query('SELECT * FROM user_pokemon WHERE user_id = $1 AND pokemon_id = $2', [userId, pokemonId]);
    
    if (checkResult.rows.length > 0) {
      await client.query('UPDATE user_pokemon SET power_up_points = power_up_points + 1 WHERE user_id = $1 AND pokemon_id = $2', [userId, pokemonId]);
      res.json({ message: 'Duplicate Pokemon. Power-up points added.' });
    } else {
      await client.query('INSERT INTO user_pokemon (user_id, pokemon_id, power_up_points) VALUES ($1, $2, 0)', [userId, pokemonId]);
      res.json({ message: 'New Pokemon added to collection.' });
    }
  } catch (error) {
    console.error('Error handling duplicate Pokemon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//ดึง collection ของผู้เล่น
app.get('/api/user-collection', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const sql = `
      SELECT DISTINCT p.pok_name, p.poke_type_card, pp.pok_image
      FROM user_pokemon up
      JOIN pokemon p ON up.pokemon_id = p.pok_id
      JOIN pic_poke pp ON p.pok_name = pp.pok_name
      WHERE up.user_id = $1
    `;
    const result = await client.query(sql, [userId]);

    const collectionWithImages = result.rows.map(pokemon => ({
      ...pokemon,
      image: pokemon.pok_image ? `data:image/png;base64,${pokemon.pok_image}` : null
    }));

    res.json(collectionWithImages);
  } catch (error) {
    console.error('Error fetching user collection:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/user-pokemon-points', async (req, res) => {
  try {
    const { user_id, pokemon_id } = req.query;
    const sql = 'SELECT power_up_points FROM user_pokemon WHERE user_id = $1 AND pokemon_id = $2';
    const result = await client.query(sql, [user_id, pokemon_id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No power-up points found' });
    }
  } catch (error) {
    console.error('Error fetching power-up points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});