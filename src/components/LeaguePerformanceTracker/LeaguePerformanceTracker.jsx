import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Crown, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw } from 'lucide-react';

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
        avatar: `/api/placeholder/150/150?text=${player.name.substring(0, 2).toUpperCase()}`,
        scores: {
          overall: calculateOverallScore(player),
          kda: player.kda || 0,
          gold: player.gold_earned || 0,
          cs: player.cs || 0,
          vision_score: player.vision_score || 0,
          damage: player.damage || 0
        }
      }));
      console.log("received players:", response.data);
      console.log("Players:", transformedPlayers);
      
      setPlayers(transformedPlayers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching players:", error);
      setIsLoading(false);
    }
  };

  const calculateOverallScore = (player) => {
  
    // Get the values, using 0 as default if the value is missing
    const scores = {
      kda: player.kda || 0,
      gold: player.gold_earned || 0,
      cs: player.cs || 0,
      vision_score: player.vision_score || 0,
      damage: player.damage || 0
    };
  
  
    // Calculate weighted average
    const overallScore = (
      scores.kda + scores.gold + scores.cs + scores.vision_score + scores.damage
    )
  
    // Ensure the score is between 0 and 100, rounded to nearest integer
    return overallScore;
  };

  // Add new player
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

  // Refresh player data
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
    // Set up auto-refresh interval
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  const getScoreForCategory = (player) => {
    const category = selectedCategory.toLowerCase().replace(' ', '_');
    console.log("Category:", category);
    return player.scores[category];
  };

  const getScoreChange = (player) => {
    const currentScore = getScoreForCategory(player);
    const prevScore = prevScores[player.id] || currentScore;
    return currentScore - prevScore;
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => getScoreForCategory(b) - getScoreForCategory(a));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-orange-500 transform hover:scale-105 transition-transform">
          <h1 className="text-3xl font-bold text-center text-blue-500">LEAGUE TRACKER</h1>
        </div>
      </div>

      {/* Add Player Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={playerNameAndTag}
            onChange={(e) => setPlayerNameAndTag(e.target.value)}
            placeholder="Enter player name + #tag (e.g. PlayerName #EUW)"
            className="flex-1 px-4 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddPlayer}
            disabled={isAddingPlayer}
            className="px-6 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isAddingPlayer ? "Adding..." : "Add Player"}
          </button>
        </div>
      </div>

      {/* Top 3 Players */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-center items-end gap-4">
          {/* 2nd Place */}
          <div className="text-center mb-4 transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-2 ring-blue-300">
              <img src={sortedPlayers[1]?.avatar} alt={sortedPlayers[1]?.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm">{sortedPlayers[1]?.name}</div>
            <div className="font-bold flex items-center justify-center gap-1">
              {formatScore(getScoreForCategory(sortedPlayers[1]), selectedCategory)}
              <ScoreChangeIndicator change={getScoreChange(sortedPlayers[1])} />
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center mb-4 transform hover:scale-110 transition-transform">
            <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-bounce" />
            <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-4 ring-yellow-500">
              <img src={sortedPlayers[0]?.avatar} alt={sortedPlayers[0]?.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm">{sortedPlayers[0]?.name}</div>
            <div className="font-bold flex items-center justify-center gap-1">
              {formatScore(getScoreForCategory(sortedPlayers[0]), selectedCategory)}
              <ScoreChangeIndicator change={getScoreChange(sortedPlayers[0])} />
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center mb-4 transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-2 ring-orange-300">
              <img src={sortedPlayers[2]?.avatar} alt={sortedPlayers[2]?.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm">{sortedPlayers[2]?.name}</div>
            <div className="font-bold flex items-center justify-center gap-1">
              {formatScore(getScoreForCategory(sortedPlayers[2]), selectedCategory)}
              <ScoreChangeIndicator change={getScoreChange(sortedPlayers[2])} />
            </div>
          </div>
        </div>
      </div>

      {/* Player List */}
      <div className="max-w-2xl mx-auto mb-8">
        {sortedPlayers.slice(3).map((player) => (
          <div 
            key={player.id}
            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-2 transform hover:scale-102 transition-all hover:bg-gray-750"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 overflow-hidden">
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
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
      <div className="max-w-2xl mx-auto">
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-40 px-6 py-2 bg-gray-800 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700"
          >
            {selectedCategory}
          </button>

          <div 
            className={`absolute top-full mt-2 flex gap-4 transition-all duration-300 origin-top ${
              isOpen 
                ? 'opacity-100 transform-none' 
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            {CATEGORIES
              .filter(cat => cat !== selectedCategory)
              .map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="w-40 px-6 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {category}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueTracker;