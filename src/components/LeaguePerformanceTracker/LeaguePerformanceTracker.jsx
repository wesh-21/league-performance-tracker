import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Crown, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, UserPlus2 } from 'lucide-react';
import MatchHistoryPopup from '../MatchHistoryPopUp/MatchHistoryPopup';
import PodiumLayout from '../PodiumLayout/PodiumLayout';
import CategorySelector from '../CategorySelector/CategorySelector';
import UserAvatar from '../UserAvatar/UserAvatar';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";
const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold", "CS"];

const LeagueTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [prevScores, setPrevScores] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlayerId, setLoadingPlayerId] = useState(null);
  const [playerNameAndTag, setPlayerNameAndTag] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [selectedMatchHistory, setSelectedMatchHistory] = useState(null);

  // Fetch players from backend
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/players`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Transform the data to match your component's structure
      const transformedPlayers = response.data.map(player => ({
        id: player.id,
        name: player.name,
        username: `@${player.name.toLowerCase().replace(/\s+/g, '_')}`,
        summoner_icon: `/summonerIcons/${player.summoner_icon}.jpg`,
        scores: {
          overall: calculateOverallScore(player),
          kda: player.kda || 0,
          gold: player.gold_earned || 0,
          cs: player.cs || 0,
          vision_score: player.vision_score || 0,
          damage: player.damage || 0
        }
      }));
      console.log("Transformed players:", transformedPlayers);
      setPlayers(transformedPlayers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching players:", error);
      setIsLoading(false);
    }
  };

  const calculateOverallScore = (player) => {
    const scores = {
      kda: player.kda || 0,
      gold: player.gold_earned || 0,
      cs: player.cs || 0,
      vision_score: player.vision_score || 0,
      damage: player.damage || 0
    };
  
    const overallScore = (
      scores.kda + scores.gold + scores.cs + scores.vision_score + scores.damage
    );
  
    return overallScore;
  };

  const handleAddPlayer = async () => {
    if (!playerNameAndTag.trim()) return;
    setIsAddingPlayer(true);
    
    try {
      const [playerName, tag] = playerNameAndTag.split(/\s*#\s*/);
      await axios.post(
        `${BACKEND_URL}/api/players`,
        { name: playerName, tag: tag },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
      );
      await fetchPlayers();
      setPlayerNameAndTag('');
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleRefreshClick = async (playerId) => {
    setLoadingPlayerId(playerId);
    try {
      await axios.get(
        `${BACKEND_URL}/api/update-last-game/${playerId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
      );
      await fetchPlayers();
    } catch (error) {
      console.error(`Error updating player ${playerId}:`, error);
    } finally {
      setLoadingPlayerId(null);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const intervalId = setInterval(() => {
      axios.get(
        `${BACKEND_URL}/api/update-last-games`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
      );
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const scores = {};
    players.forEach(player => {
      scores[player.id] = getScoreForCategory(player);
    });
    setPrevScores(scores);
  }, [selectedCategory]);
  const ScoreChangeIndicator = ({ change }) => {
    if (change === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };
  const formatScore = (score, category) => {
    if (category === 'Kda') return score.toFixed(2);
    if (category === 'Gold') return score.toLocaleString();
    return score;
  };

  const getScoreForCategory = (player) => {
    if (!player) return 0;
    const category = selectedCategory.toLowerCase().replace(' ', '_');
    return player.scores[category];
  };

  const getScoreChange = (player) => {
    if (!player) return 0;
    const currentScore = getScoreForCategory(player);
    const prevScore = prevScores[player.id] || currentScore;
    return currentScore - prevScore;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#151729] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Empty state when no players exist
  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-[#151729] text-white p-6">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-[#151729] p-4 rounded-lg border-2 border-orange-500 transform hover:scale-105 transition-transform">
            <h1 className="text-3xl font-bold text-center text-blue-500">LEAGUE TRACKER</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
        <div className="bg-[#151729] p-2 rounded-lg text-center">
  <UserPlus2 className="w-12 h-12 text-blue-500 mx-auto mb-2" /> {/* Reduced from w-16 h-16 */}
  <h2 className="text-xl font-bold mb-2">No Players Added Yet</h2> {/* Reduced margin-bottom */}
  <p className="text-gray-400 mb-4">Add your first player to start tracking their performance!</p> {/* Reduced margin-bottom */}
 
  <div className="flex gap-4 justify-center">
    <input
      type="text"
      value={playerNameAndTag}
      onChange={(e) => setPlayerNameAndTag(e.target.value)}
      placeholder="Enter player name + #tag (e.g. PlayerName #EUW)"
      className="px-4 h-8 leading-tight bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-96 text-sm appearance-none"
    />
    <button
      onClick={handleAddPlayer}
      disabled={isAddingPlayer}
      className="px-6 h-8 leading-tight bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
    >
      {isAddingPlayer ? "Adding..." : "Add Player"}
    </button>
  </div>
</div>
        </div>
      </div>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => getScoreForCategory(b) - getScoreForCategory(a));

  // Podium section with null checks
  const renderPodium = () => {
    if (players.length < 3) {
      return (
        <div className="text-center mb-8">
          <p className="text-gray-400">Add more players to see the ranking podium!</p>
        </div>
      );
    }
  
    return (
      <PodiumLayout
        sortedPlayers={sortedPlayers}
        selectedCategory={selectedCategory}
        setSelectedMatchHistory={setSelectedMatchHistory}
        formatScore={formatScore}
        getScoreForCategory={getScoreForCategory}
        getScoreChange={getScoreChange}
        ScoreChangeIndicator={ScoreChangeIndicator}
      />
    );
  };

  return (
    <div className="relative min-h-screen bg-[#151729] text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="w-full bg-gray-900 py-6 relative">
        <UserAvatar /> {/* Added UserAvatar here */}
        <div className="max-w-2xl mx-auto text-center">
          <img 
            src="/assets/logo.png" 
            alt="League Tracker Logo" 
            className="h-24 mx-auto md:h-32"
          />
        </div>
      </div>


      {/* Add Player Form */}
      <div className="max-w-2xl mx-auto mb-6 mt-2">
        <div className="flex gap-2 sm:gap-4">
          <input
            type="text"
            value={playerNameAndTag}
            onChange={(e) => setPlayerNameAndTag(e.target.value)}
            placeholder="Enter player name + #tag (e.g. PlayerName #EUW)"
            className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAddPlayer}
            disabled={isAddingPlayer}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
          >
            {isAddingPlayer ? "Adding..." : "Add Player"}
          </button>
        </div>
      </div>


      {/* Podium */}
      <div className="max-w-2xl mx-auto mb-4">
        {renderPodium()}
      </div>

{/* Player List */}
<div className="max-w-2xl mx-auto mb-4 overflow-y-auto overflow-x-hidden max-h-[240px] md:max-h-[400px]">
  {sortedPlayers.slice(3).map((player) => (
    <div 
      key={player.id}
      className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-2 transform hover:scale-102 transition-all hover:bg-gray-750"
      onClick={() => setSelectedMatchHistory(player)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 overflow-hidden">
          <img src={player.summoner_icon} alt={player.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-semibold">{player.name}</div>
          <div className="text-sm text-gray-400">{player.username}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-bold flex items-center gap-2">
          <div className="transition-all duration-300">
            {formatScore(getScoreForCategory(player), selectedCategory)}
          </div>
          <ScoreChangeIndicator change={getScoreChange(player)} />
        </div>
        <button
          onClick={() => handleRefreshClick(player.id)}
          disabled={loadingPlayerId === player.id}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loadingPlayerId === player.id ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  ))}
</div>




{/* Category Selector */}
    <CategorySelector 
      categories={CATEGORIES}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />

      {selectedMatchHistory && (
        <MatchHistoryPopup
          playerId={selectedMatchHistory.id}
          playerName={selectedMatchHistory.name}
          onClose={() => setSelectedMatchHistory(null)}
        />
      )}
    </div>
    
  );
};

export default LeagueTracker;