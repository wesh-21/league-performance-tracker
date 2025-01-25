import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite Database
const db = new sqlite3.Database('./players.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        OVERALL INTEGER NOT NULL DEFAULT 0,
        KDA INTEGER NOT NULL DEFAULT 0,
        VISION_SCORE INTEGER NOT NULL DEFAULT 0,
        DAMAGE INTEGER NOT NULL DEFAULT 0,
        GOLD_EARNED INTEGER NOT NULL DEFAULT 0,
        CS INTEGER NOT NULL DEFAULT 0
      )
    `);
  }
});

// Get all players
app.get('/players', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new player
app.post('/players', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO players (name) VALUES (?)', [name], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Utility function to update a specific field for a player
const updatePlayerField = (id, field, value, res) => {
  db.get(`SELECT ${field} FROM players WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (row) {
      const currentValue = row[field] || 0;
      const newValue = currentValue + value;

      db.run(`UPDATE players SET ${field} = ? WHERE id = ?`, [newValue, id], function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.json({ id, field, oldValue: currentValue, newValue });
      });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });
};

// Specific update routes
app.put('/players/:id/overall', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'OVERALL', value, res);
});

app.put('/players/:id/damage', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'DAMAGE', value, res);
});

app.put('/players/:id/kda', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'KDA', value, res);
});

app.put('/players/:id/vision_score', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'VISION_SCORE', value, res);
});

app.put('/players/:id/gold_earned', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'GOLD_EARNED', value, res);
});

app.put('/players/:id/cs', (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // Integer to add
  updatePlayerField(id, 'CS', value, res);
});

// Delete a player
app.delete('/players/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM players WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
