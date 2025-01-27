import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// Import the functions from RiotApi.js
import { getPuuidByRiotId, getMatchesByPuuid, getMatchByMatchId } from './RiotApi.js';

dotenv.config();

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
        tag TEXT NOT NULL,
        puuid TEXT,
        last_match_id TEXT,
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
  const { name, tag } = req.body;
  db.run('INSERT INTO players (name, tag) VALUES (?, ?)', [name, tag], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const player = { name, tag, id: this.lastID };

    updatePlayerPoints(player, res); // Call to update player points
  });
});

// Fetch and update last game data for all players
app.get('/update-last-games', async (req, res) => {
  try {
    db.all('SELECT * FROM players', [], async (err, players) => {
      if (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
        return;
      }

      for (const player of players) {
        try {
          await updatePlayerPoints(player, res); // Now it sends the response after all updates are completed
        } catch (error) {
          console.error(`Error processing player ${player.name}:`, error.message);
        }
      }

      res.json({ message: 'Last game data updated for all players' }); // Send response after all updates are finished
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Fetch and update last game data for a specific player
app.get('/update-last-game/:id', async (req, res) => {
  const { id } = req.params; // Get player ID from URL parameter
  console.log(`Updating last game data for player ${id}`);
  try {
    db.get('SELECT * FROM players WHERE id = ?', [id], async (err, player) => {
      if (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
        return;
      }

      if (!player) {
        res.status(404).json({ error: 'Player not found' });
        return;
      }

      try {
        await updatePlayerPoints(player, res); // Update the player's last game data
        res.json({ message: `Last game data updated for player ${player.name}` }); // Send response after update
      } catch (error) {
        console.error(`Error processing player ${player.name}:`, error.message);
        res.status(500).json({ error: 'Error updating player data', details: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


const updatePlayerPoints = async (player, res) => {
  try {
    if (!player.puuid) {
      const accountData = await getPuuidByRiotId(player.name, player.tag);
      player.puuid = accountData.puuid;
      db.run('UPDATE players SET puuid = ? WHERE id = ?', [player.puuid, player.id]);
    }

    const matchIds = await getMatchesByPuuid(player.puuid, 0, 1);
    if (matchIds.length === 0) return;

    const latestMatchId = matchIds[0];
    if (latestMatchId === player.last_match_id) return;

    const matchData = await getMatchByMatchId(latestMatchId);
    parseMatchData(matchData, player.puuid, player.id); // Don't pass res to parseMatchData

    fs.writeFileSync(`./matches/${latestMatchId}.json`, JSON.stringify(matchData, null, 2));

    db.run(
      'UPDATE players SET last_match_id = ? WHERE id = ?',
      [latestMatchId, player.id]
    );

    // Only send the response once all updates are done
    res.json({ message: 'Player stats updated successfully' });

  } catch (error) {
    console.error(`Error processing player ${player.name}:`, error.message);
    res.status(500).json({ error: 'Server error during player update', details: error.message });
  }
};


const parseMatchData = (match, puuid, playerId) => {
  const participants = match.info.participants;
  const player = participants.find(p => p.puuid === puuid);
  console.log("Parsing match data for player:", player.riotIdGameName);

  if (!player) {
    console.error(`Player with PUUID ${puuid} not found in match`);
    return;
  }

  const playerStats = {
    kills: player.kills,
    deaths: player.deaths,
    kda: player.challenges.kda || 0,
    goldEarned: player.goldEarned,
    totalDamageDealtToChampions: player.totalDamageDealtToChampions,
    neutralMinionsKilled: player.neutralMinionsKilled,
  };
  console.log("Player Stats: ", playerStats);
  const bestStats = {
    mostKills: participants.reduce((max, p) => Math.max(max, p.kills), 0),
    bestKDA: participants.reduce((max, p) => Math.max(max, p.challenges.kda || 0), 0),
    mostGold: participants.reduce((max, p) => Math.max(max, p.goldEarned), 0),
    mostDamage: participants.reduce((max, p) => Math.max(max, p.totalDamageDealtToChampions), 0),
    mostCS: participants.reduce((max, p) => Math.max(max, p.neutralMinionsKilled), 0),
  };
  console.log("Best Stats: ", bestStats);

  // Determine points for each category
  const categories = {
    KDA: playerStats.kda === bestStats.bestKDA ? 1 : 0,
    DAMAGE: playerStats.totalDamageDealtToChampions === bestStats.mostDamage ? 1 : 0,
    GOLD_EARNED: playerStats.goldEarned === bestStats.mostGold ? 1 : 0,
    CS: playerStats.neutralMinionsKilled === bestStats.mostCS ? 1 : 0,
  };
  console.log("Categories: ", categories);

  // Use Promise.all to update all categories in parallel
  const updatePromises = Object.entries(categories).map(([category, points]) =>
    new Promise((resolve, reject) => {
      updatePlayerField(playerId, category, points, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  );

  // Wait for all updates to finish
  Promise.all(updatePromises).catch((error) => {
    console.error('Error updating player stats:', error.message);
  });
};

// Utility function to update a specific field for a player
const updatePlayerField = (id, field, value, callback) => {
  db.get(`SELECT ${field} FROM players WHERE id = ?`, [id], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (row) {
      const currentValue = row[field] || 0;
      const newValue = currentValue + value;

      db.run(`UPDATE players SET ${field} = ? WHERE id = ?`, [newValue, id], function (err) {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, { id, field, oldValue: currentValue, newValue });
      });
    } else {
      callback(new Error('Player not found'), null);
    }
  });
};

// Specific update routes
app.put('/players/:id/overall', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  updatePlayerField(id, 'OVERALL', value, res);
});

app.put('/players/:id/damage', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  updatePlayerField(id, 'DAMAGE', value, res);
});

app.put('/players/:id/kda', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  updatePlayerField(id, 'KDA', value, res);
});

app.put('/players/:id/vision_score', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  updatePlayerField(id, 'VISION_SCORE', value, res);
});

app.put('/players/:id/gold_earned', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  updatePlayerField(id, 'GOLD_EARNED', value, res);
});

app.put('/players/:id/cs', (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
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
