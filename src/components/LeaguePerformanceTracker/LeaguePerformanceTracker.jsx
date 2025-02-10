import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import PatchNotesPanel from "../PatchNotesPanel/PatchNotesPanel";
import PointManagementModal from "../PointManagementModal/PointManagementModal";
import MatchLogs from "../MatchLogs/MatchLogs";
import styles from "./LeaguePerformanceTracker.module.css";
import { useUser } from '../../main';
import FriendsPanel from '../FriendsPanel/FriendsPanel';

const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold Earned", "CS"];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const { authToken } = useUser();

  const fetchPlayers = async () => {
    try {
      console.log("Fetching players...");
      const response = await axios.get(`${BACKEND_URL}/api/players`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const addPlayer = async (playerNameandTag) => {
    console.log("Adding player ", playerNameandTag);
    if (playerNameandTag.trim()) {
      const [playerName, tag] = playerNameandTag.split(/\s*#\s*/);
      try {
        await axios.post(`${BACKEND_URL}/api/players`, 
          { name: playerName, tag: tag },
          { headers: { Authorization: `Bearer ${authToken}` }}
        );
        await fetchPlayers();
      } catch (error) {
        console.error("Error adding player:", error);
      }
    }
  };

  const updateLastGames = async () => {
    try {
      console.log('Updating last games...');
      const response = await axios.get(
        `${BACKEND_URL}/api/update-last-games`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      console.log(response.data.message);
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating last games:', error);
    }
  };

  const modifyPlayerPoints = async (id, category, value) => {
    const formattedCategory = category.toLowerCase().replace(" ", "_").toUpperCase();
    try {
      await axios.put(
        `${BACKEND_URL}/api/players/${id}/${formattedCategory}`,
        { value },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      fetchPlayers();
    } catch (error) {
      console.error(`Error updating ${category} points for player ID ${id}:`, error);
    }
  };

  const deletePlayer = async (id) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/api/players/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  return { 
    players, 
    fetchPlayers, 
    addPlayer,
    updateLastGames, 
    modifyPlayerPoints, 
    deletePlayer 
  };
};

const LeaguePerformanceTracker = () => {
  const { id: userID, username: loggedInUser, authToken, clearUser } = useUser();
  const [playerNameandTag, setPlayerNameandTag] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isPatchNotesVisible, setIsPatchNotesVisible] = useState(false);
  const [selectedMatchLogs, setSelectedMatchLogs] = useState(null);

  const { 
    players, 
    fetchPlayers, 
    addPlayer, 
    modifyPlayerPoints, 
    deletePlayer,
    updateLastGames
  } = usePlayerManagement();

  useEffect(() => {
    if (authToken) {
      fetchPlayers();
      console.log('User entered the app:', loggedInUser);
      console.log("userid", userID);
      const intervalId = setInterval(updateLastGames, 15 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [authToken]);

  const handleAddPlayer = async () => {
    if (!playerNameandTag.trim()) return;
    setIsAddingPlayer(true);
    await addPlayer(playerNameandTag);
    setPlayerNameandTag("");
    setIsAddingPlayer(false);
  };

  const handleRefreshClick = async (playerId) => {
    setLoadingPlayerId(playerId);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/update-last-game/${playerId}`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      console.log(`Player ${playerId} data updated:`, response.data);
      fetchPlayers();
    } catch (error) {
      console.error(`Error updating player ${playerId}:`, error);
    } finally {
      setLoadingPlayerId(null);
    }
  };

  const handlePlayerClick = (player) => {
    if (selectedMatchLogs?.id === player.id) {
      setSelectedMatchLogs(null);
    } else {
      setSelectedMatchLogs(player);
    }
  };

  const getPlayerPoints = () => {
    if (activeTab === "Overall") {
      return players.map((player) => ({
        id: player.id,
        name: player.name,
        points: CATEGORIES.slice(1).reduce(
          (sum, category) => sum + (player[category.toUpperCase().replace(" ", "_")] || 0),
          0
        ),
      }));
    }
    return players.map((player) => ({
      id: player.id,
      name: player.name,
      points: player[activeTab.toUpperCase().replace(" ", "_")] || 0,
    }));
  };

  return (
    <div className="app-container">
      <PatchNotesPanel 
        isVisible={isPatchNotesVisible} 
        onToggle={() => setIsPatchNotesVisible(!isPatchNotesVisible)} 
      />
      <FriendsPanel />



      <div className="main-content">
        <div className="w-screen h-screen">
          <h1 className="main-header">League Performance Tracker</h1>

          <div className="user-info">
            <span>Welcome, {loggedInUser}!</span>
          </div>

          <div className="add-player-section">
            <input
              type="text"
              value={playerNameandTag}
              onChange={(e) => setPlayerNameandTag(e.target.value)}
              placeholder="Enter player name + #tag (e.g. ch4t r3str1ct3d #EUW)"
              className="input-field"
            />
            <button
              onClick={handleAddPlayer}
              disabled={isAddingPlayer}
              className="btn-primary"
            >
              {isAddingPlayer ? "Adding..." : "Add Player"}
            </button>
          </div>

          <div className="tabs">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`tab-button ${activeTab === category ? "active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="bar-chart-container">
            <h2>{activeTab} Leaderboard</h2>
            <BarChart width={700} height={400} data={getPlayerPoints()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#272471" />
            </BarChart>
          </div>

          <div>
            {getPlayerPoints().map((player) => (
              <div key={player.id} className="player-list-item">
                <span
                  className="player-name cursor-pointer hover:text-blue-600"
                  onClick={() => handlePlayerClick(players.find(p => p.id === player.id))}
                >
                  {player.name}
                </span>

                <span className="player-points">{player.points} points</span>

                <button
                  onClick={() => handleRefreshClick(player.id)}
                  disabled={loadingPlayerId === player.id}
                  className="refresh-button"
                >
                  {loadingPlayerId === player.id ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            ))}
          </div>

          {selectedPlayer && (
            <PointManagementModal
              player={selectedPlayer}
              onClose={() => setSelectedPlayer(null)}
              onDelete={deletePlayer}
              onPointModify={modifyPlayerPoints}
            />
          )}

          {selectedMatchLogs && (
            <div className={styles['match-logs-panel']}>
              <div className={styles['content']}>
                <MatchLogs
                  playerId={selectedMatchLogs.id}
                  playerName={selectedMatchLogs.name}
                  onClose={() => setSelectedMatchLogs(null)}
                />
              </div>
            </div>
          )}

          <button onClick={clearUser} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaguePerformanceTracker;