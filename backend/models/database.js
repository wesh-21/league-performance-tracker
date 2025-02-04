import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./players.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
  }
});

export default db;
