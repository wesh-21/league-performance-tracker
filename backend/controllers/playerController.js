import db from '../models/database.js';
import {
  getPuuidByRiotId,
  getMatchesByPuuid,
  getMatchByMatchId,
} from '../RiotApi.js';

export const getAllPlayers = (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

export const addPlayer = (req, res) => {
  const { name, tag } = req.body;
  db.run('INSERT INTO players (name, tag) VALUES (?, ?)', [name, tag], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({ name, tag, id: this.lastID });
  });
};

export const updateLastGames = (req, res) => {
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
};

export const updatePlayerLastGame = (req, res) => {
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
};

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
    // uncomment to save data to file
    //console.log("Saving match data to file...");
    //fs.writeFileSync(`./matches/${latestMatchId}.json`, JSON.stringify(matchData, null, 2)); 

    
    const categories = parseMatchData(matchData, player.puuid);

    // Use Promise.all to update all categories in parallel
    const updatePromises = Object.entries(categories).map(([category, points]) =>
    new Promise((resolve, reject) => {
      updatePlayerField(player.id, category, points, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  );

  // Wait for all updates to finish
  Promise.all(updatePromises).catch((error) => {
    console.error('Error updating player stats:', error.message);
  });

    db.run(
      'UPDATE players SET last_match_id = ? WHERE id = ?',
      [latestMatchId, player.id]
    );

    // Only send the response once all updates are done

  } catch (error) {
    console.error(`Error processing player ${player.name}:`, error.message);
  }
};

const parseMatchData = (match, puuid) => {
  const participants = match.info.participants;
  const player = participants.find(p => p.puuid === puuid);
  console.log("Parsing match data for player:", player?.riotIdGameName);

  if (!player) {
    console.error(`Player with PUUID ${puuid} not found in match`);
    return;
  }

  if (match.info.gameMode !== 'CLASSIC') {
    console.log(`This game mode is not supported yet: ${match.info.gameMode}`);
    return;
  }


  // Calculate total CS for the player
  const totalCs = player.neutralMinionsKilled + player.totalMinionsKilled;

  const playerStats = {
    kills: player.kills,
    deaths: player.deaths,
    kda: player.challenges.kda || 0,
    goldEarned: player.goldEarned,
    totalDamageDealtToChampions: player.totalDamageDealtToChampions,
    totalCs: totalCs, // Replace neutralMinionsKilled with totalCs
    visionScore: player.visionScore,
  };

  console.log("Player Stats: ", playerStats);

  const bestStats = {
    mostKills: participants.reduce((max, p) => Math.max(max, p.kills), 0),
    bestKDA: participants.reduce((max, p) => Math.max(max, p.challenges.kda || 0), 0),
    mostGold: participants.reduce((max, p) => Math.max(max, p.goldEarned), 0),
    mostDamage: participants.reduce((max, p) => Math.max(max, p.totalDamageDealtToChampions), 0),
    mostCS: participants.reduce((max, p) => Math.max(max, p.neutralMinionsKilled + p.totalMinionsKilled), 0), // Adjust for total CS
    mostVisionScore: participants.reduce((max, p) => Math.max(max, p.visionScore), 0),
  };
  console.log("Best Stats: ", bestStats);

  const categories = {
    KDA: 0,
    DAMAGE: 0,
    GOLD_EARNED: 0,
    CS: 0,
    VISION_SCORE: 0,
  };
  // Determine points for each category (Only if player wins)
  console.log("Player Win: ", player.win);

  if( Boolean(player.win) == true ) {
    console.log("Ganhamos caralho");
    categories.KDA = playerStats.kda === bestStats.bestKDA ? 1 : 0;
    categories.DAMAGE = playerStats.totalDamageDealtToChampions === bestStats.mostDamage ? 1 : 0;
    categories.GOLD_EARNED = playerStats.goldEarned === bestStats.mostGold ? 1 : 0;
    categories.CS = playerStats.totalCs === bestStats.mostCS ? 1 : 0;
    categories.VISION_SCORE = playerStats.visionScore === bestStats.mostVisionScore ? 1 : 0;
  }

  console.log("Categories: ", categories);
  return categories
};


const updatePlayerField = (id, field, value) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${field} FROM players WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        const currentValue = row[field] || 0;
        const newValue = currentValue + value;
        db.run(`UPDATE players SET ${field} = ? WHERE id = ?`, [newValue, id], function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id, field, oldValue: currentValue, newValue });
        });
      } else {
        reject(new Error('Player not found'));
      }
    });
  });
};

export const updateOverall = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'OVERALL', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateDamage = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'DAMAGE', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateKDA = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'KDA', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateVisionScore = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'VISION_SCORE', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateGoldEarned = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'GOLD_EARNED', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCS = async (req, res) => {
  try {
    const result = await updatePlayerField(req.params.id, 'CS', req.body.value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deletePlayer = (req, res) => {
  db.run('DELETE FROM players WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
};

export const getMatchLogs = (req, res) => {
  console.log('Request params:', req.params);
  const { id } = req.params;
  console.log(`Fetching match logs for player ${id}`);

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
      if (!player.puuid) {
        const accountData = await getPuuidByRiotId(player.name, player.tag);
        player.puuid = accountData.puuid;
        db.run('UPDATE players SET puuid = ? WHERE id = ?', [player.puuid, player.id]);
      }

      const matchIds = await getMatchesByPuuid(player.puuid, 0, 10);
      if (matchIds.length === 0) {
        res.json({ message: `Player ${id} has no recent matches`, categories: [] });
        return;
      }

      const categoriesArray = [];

      for (const matchId of matchIds) {
        try {
          const matchData = await getMatchByMatchId(matchId);
          const categories = parseMatchData(matchData, player.puuid);
          categories['WIN'] = matchData.info.participants.find(p => p.puuid === player.puuid).win;
          categories['DATE'] = matchData.info.gameCreation;
          categories['CHAMPION'] = matchData.info.participants.find(p => p.puuid === player.puuid).championName;
          
          if (categories && Object.keys(categories).length > 0) {
            categoriesArray.push(categories);
          }
        } catch (error) {
          console.error(`Error processing match ${matchId}:`, error.message);
          // Continue with the next match even if one fails
          continue;
        }
      }
      console.log("Categories Array: ", categoriesArray);
      
      res.json({ message: `Player ${id} data fetched`, categories: categoriesArray });
  }
  catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
)};