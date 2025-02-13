import pool from '../models/database.js';
import {
  getPuuidByRiotId,
  getMatchesByPuuid,
  getMatchByMatchId,
} from '../RiotApi.js';

export const getAllPlayers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players');
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addPlayer = async (req, res) => {
  const { name, tag } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO players (name, tag) VALUES ($1, $2) RETURNING *',
      [name, tag]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateLastGames = async (req, res) => {
  try {
    const { rows: players } = await pool.query('SELECT * FROM players');
    
    for (const player of players) {
      try {
        await updatePlayerPoints(player);
      } catch (error) {
        console.error(`Error processing player 1 ${player.name}:`, error.message);
      }
    }
    
    res.json({ message: 'Last game data updated for all players' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updatePlayerLastGame = async (req, res) => {
  const { id } = req.params;
  console.log(`Updating last game data for player ${id}`);
  
  try {
    const { rows } = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
    const player = rows[0];
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await updatePlayerPoints(player);
    res.json({ message: `Last game data updated for player ${player.name}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updatePlayerPoints = async (player) => {
  try {
    if (!player.puuid) {
      const accountData = await getPuuidByRiotId(player.name, player.tag);
      player.puuid = accountData.puuid;
      await pool.query(
        'UPDATE players SET puuid = $1 WHERE id = $2',
        [player.puuid, player.id]
      );
    }

    const matchIds = await getMatchesByPuuid(player.puuid, 0, 1);
    if (matchIds.length === 0) return;

    const latestMatchId = matchIds[0];
    if (latestMatchId === player.last_match_id) return;

    const matchData = await getMatchByMatchId(latestMatchId);
    const categories = parseMatchData(matchData, player.puuid);

    // Update all categories in parallel using Promise.all
    await Promise.all(
      Object.entries(categories).map(([category, points]) =>
        updatePlayerField(player.id, category, points)
      )
    );

    await pool.query(
      'UPDATE players SET last_match_id = $1 WHERE id = $2',
      [latestMatchId, player.id]
    );
  } catch (error) {
    console.error(`Error processing player 2 ${player.name}:`, error.message);
    throw error;
  }
};

const updatePlayerField = async (id, field, value) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${field} FROM players WHERE id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      throw new Error('Player not found');
    }

    const currentValue = rows[0][field] || 0;
    const newValue = currentValue + value;
    
    await pool.query(
      `UPDATE players SET ${field} = $1 WHERE id = $2`,
      [newValue, id]
    );
    
    return { id, field, currentValue, newValue };
  } catch (error) {
    throw error;
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
    kda: 0,
    damage: 0,
    gold_earned: 0,
    cs: 0,
    viison_score: 0,
  };
  // Determine points for each category (Only if player wins)
  console.log("Player Win: ", player.win);

  if( Boolean(player.win) == true ) {
    console.log("Ganhamos caralho");
    categories.kda = playerStats.kda === bestStats.bestKDA ? 1 : 0;
    categories.damage = playerStats.totalDamageDealtToChampions === bestStats.mostDamage ? 1 : 0;
    categories.gold_earned = playerStats.goldEarned === bestStats.mostGold ? 1 : 0;
    categories.cs = playerStats.totalCs === bestStats.mostCS ? 1 : 0;
    categories.viison_score = playerStats.visionScore === bestStats.mostVisionScore ? 1 : 0;
  }

  console.log("Categories: ", categories);
  return categories
};


// Update the individual field update functions
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

export const deletePlayer = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM players WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMatchLogs = async (req, res) => {
  console.log('Request params:', req.params);
  const { id } = req.params;
  console.log(`Fetching match logs for player ${id}`);

  try {
    const { rows } = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
    const player = rows[0];

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!player.puuid) {
      const accountData = await getPuuidByRiotId(player.name, player.tag);
      player.puuid = accountData.puuid;
      await pool.query(
        'UPDATE players SET puuid = $1 WHERE id = $2',
        [player.puuid, player.id]
      );
    }

    const matchIds = await getMatchesByPuuid(player.puuid, 0, 10);
    if (matchIds.length === 0) {
      return res.json({ message: `Player ${id} has no recent matches`, categories: [] });
    }

    const categoriesArray = [];

    for (const matchId of matchIds) {
      try {
        const matchData = await getMatchByMatchId(matchId);
        const categories = parseMatchData(matchData, player.puuid);
        console.log("Categories: ", categories);
        if (categories) {
          const participant = matchData.info.participants.find(p => p.puuid === player.puuid);
          categories['WIN'] = participant.win;
          categories['DATE'] = matchData.info.gameCreation;
          categories['CHAMPION'] = participant.championName;
          categoriesArray.push(categories);
        }
      } catch (error) {
        console.error(`Error processing match ${matchId}:`, error.message);
        continue;
      }
    }

    console.log("Categories Array: ", categoriesArray);
    res.json({ message: `Player ${id} data fetched`, categories: categoriesArray });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};