import express from 'express';
import { 
    getAllPlayers, 
    addPlayer, 
    updateLastGames, 
    updatePlayerLastGame,
    updateOverall,
    updateDamage,
    updateKDA,
    updateVisionScore,
    updateGoldEarned,
    updateCS,
    deletePlayer,
    getMatchLogs,
    getSummonerById,
} from '../controllers/playerController.js';

const router = express.Router();

router.get('/players', getAllPlayers);
router.post('/players', addPlayer);

// Fetch and update last game data for all players
router.get('/update-last-games', updateLastGames);
router.get('/update-last-game/:id', updatePlayerLastGame);
router.get('/players/match-logs/:id', getMatchLogs);
router.get('/players/summoner/:id', getSummonerById)


router.put('/players/:id/overall', updateOverall);
router.put('/players/:id/damage', updateDamage);
router.put('/players/:id/kda', updateKDA);
router.put('/players/:id/vision_score', updateVisionScore);
router.put('/players/:id/gold_earned', updateGoldEarned);
router.put('/players/:id/cs', updateCS);
router.delete('/players/:id', deletePlayer);



export default router;
