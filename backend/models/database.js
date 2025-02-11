import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;


console.log('DATABASE_URL:', process.env.DB_URL);
const pool = new Pool({
  connectionString: process.env.DB_URL, // Use the environment variable
  ssl: { rejectUnauthorized: false } // Enable SSL connection with appropriate setting
});


const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        tag TEXT NOT NULL,
        puuid TEXT,
        last_match_id TEXT,
        OVERALL INTEGER NOT NULL DEFAULT 0,
        KDA INTEGER NOT NULL DEFAULT 0,
        VISION_SCORE INTEGER NOT NULL DEFAULT 0,
        DAMAGE INTEGER NOT NULL DEFAULT 0,
        GOLD_EARNED INTEGER NOT NULL DEFAULT 0,
        CS INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id1 INTEGER NOT NULL,
        user_id2 INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id1) REFERENCES users(id),
        FOREIGN KEY (user_id2) REFERENCES users(id)
      );
    `);

    console.log('Connected to PostgreSQL database and initialized tables.');
    client.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Initialize the database
initializeDatabase();

// Export the pool to use in other files
export default pool;