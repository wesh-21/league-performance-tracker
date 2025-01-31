import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import PatchNotesPanel from "../PatchNotesPanel/PatchNotesPanel";
import PointManagementModal from "../PointManagementModal/PointManagementModal";

// Constants
const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold Earned", "CS"];
const BACKEND_URL = process.env.BACKEND_URL || "https://league-performance-tracker.onrender.com";

// Hooks
const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      console.log("Fetching players...");
      const response = await axios.get(`${BACKEND_URL}/players`);
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
        await axios.post(`${BACKEND_URL}/players`, { name: playerName, tag: tag });
        await fetchPlayers();
      } catch (error) {
        console.error("Error adding player:", error);
      }
    }
  };

  const updateLastGames = async () => {
    try {
      console.log('Updating last games...');
      const response = await axios.get(`${BACKEND_URL}/update-last-games`);
      console.log(response.data.message);
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating last games:', error);
    }
  };

  const modifyPlayerPoints = async (id, category, value) => {
    const formattedCategory = category.toLowerCase().replace(" ", "_").toUpperCase();
    try {
      await axios.put(`${BACKEND_URL}/players/${id}/${formattedCategory}`, { value });
      fetchPlayers();
    } catch (error) {
      console.error(`Error updating ${category} points for player ID ${id}:`, error);
    }
  };

  const deletePlayer = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/players/${id}`);
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

const LeaguePerformanceTracker = ({ setAuthToken, setUsername }) => {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [playerNameandTag, setPlayerNameandTag] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isPatchNotesVisible, setIsPatchNotesVisible] = useState(false);

  const { 
    players, 
    fetchPlayers, 
    addPlayer, 
    modifyPlayerPoints, 
    deletePlayer,
    updateLastGames
  } = usePlayerManagement();

  useEffect(() => {
    // Fetch auth token and loggedInUser from localStorage
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("username");

    if (storedToken) {
      console.log("Restoring auth token from localStorage:", storedToken);
      setAuthToken(storedToken); // Restore the token from localStorage
    }

    if (storedUser) {
      setLoggedInUser(storedUser); // Restore the username from localStorage
    }

    fetchPlayers(); // Load initial players
    const intervalId = setInterval(updateLastGames, 15 * 60 * 1000); // Update every 15 minutes
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [setAuthToken]);

  const handleAddPlayer = async () => {
    if (!playerNameandTag.trim()) return;
    setIsAddingPlayer(true); // Show loading state
    await addPlayer(playerNameandTag);
    setPlayerNameandTag("");
    setIsAddingPlayer(false); // Hide loading state
  };

  const handleRefreshClick = async (playerId) => {
    setLoadingPlayerId(playerId); // Set the loading state to show a loading indicator
    try {
      const response = await axios.get(`${BACKEND_URL}/update-last-game/${playerId}`);
      console.log(`Player ${playerId} data updated:`, response.data);
      fetchPlayers(); // Refresh player list
    } catch (error) {
      console.error(`Error updating player ${playerId}:`, error);
    } finally {
      setLoadingPlayerId(null); // Reset the loading state
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

  const handleLogout = () => {
    setAuthToken(null); // Clear auth token
    setUsername(''); // Clear username
    localStorage.removeItem('authToken'); // Remove token from localStorage
    localStorage.removeItem('username'); // Remove username from localStorage
  };

  return (
    <div className="app-container">
      <PatchNotesPanel 
        isVisible={isPatchNotesVisible} 
        onToggle={() => setIsPatchNotesVisible(!isPatchNotesVisible)} 
      />
      <div className="main-content">
        <div className="w-screen h-screen">
          <h1 className="main-header">League Performance Tracker</h1>

          {/* Display the logged in user's username */}
          <div className="user-info">
            <span>Welcome, {loggedInUser}!</span>
          </div>

          {/* Add Player Section */}
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
              disabled={isAddingPlayer} // Disable button while adding player
              className="btn-primary"
            >
              {isAddingPlayer ? "Adding..." : "Add Player"}
            </button>
          </div>

          {/* Tabs */}
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

          {/* Bar Chart */}
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

          {/* Player List */}
          <div>
            {getPlayerPoints().map((player) => (
              <div key={player.id} className="player-list-item">
                {/* Player Name */}
                <span
                  className="player-name"
                  onClick={() => setSelectedPlayer(players.find((p) => p.id === player.id) || null)}
                >
                  {player.name}
                </span>

                {/* Player Points */}
                <span className="player-points">{player.points} points</span>

                {/* Refresh Button */}
                <button
                  onClick={() => handleRefreshClick(player.id)}
                  disabled={loadingPlayerId === player.id} // Disable button while refreshing
                  className="refresh-button"
                >
                  {loadingPlayerId === player.id ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedPlayer && (
            <PointManagementModal
              player={selectedPlayer}
              onClose={() => setSelectedPlayer(null)}
              onDelete={deletePlayer}
              onPointModify={modifyPlayerPoints}
            />
          )}

          {/* Logout Button */}
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaguePerformanceTracker;
