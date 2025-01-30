import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Constants
const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold Earned", "CS"];

// Hooks
const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      console.log("Fetching players...");
      const response = await axios.get("http://localhost:5000/players");
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
        await axios.post("http://localhost:5000/players", { name: playerName, tag: tag });
        await fetchPlayers();
      } catch (error) {
        console.error("Error adding player:", error);
      }
    }
  };

  const updateLastGames = async () => {
    try {
      console.log('Updating last games...');
      const response = await axios.get('http://localhost:5000/update-last-games');
      console.log(response.data.message);
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating last games:', error);
    }
  };

  const modifyPlayerPoints = async (id, category, value) => {
    const formattedCategory = category.toLowerCase().replace(" ", "_").toUpperCase();
    try {
      await axios.put(`http://localhost:5000/players/${id}/${formattedCategory}`, { value });
      fetchPlayers();
    } catch (error) {
      console.error(`Error updating ${category} points for player ID ${id}:`, error);
    }
  };

  const deletePlayer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/players/${id}`);
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

// Components
const PointManagementModal = ({ player, onClose, onDelete, onPointModify }) => (
  <div className="modal-overlay">
    <div className="modal-container">
      <h2 className="modal-title">Manage Points for {player.name}</h2>
      <div className="modal-grid">
        {CATEGORIES.slice(1).map((category) => (
          <div key={category} className="modal-item">
            <button
              onClick={() => onPointModify(player.id, category, 1)}
              className="btn btn-add"
            >
              +1 {category}
            </button>
            <button
              onClick={() => onPointModify(player.id, category, -1)}
              className="btn btn-remove"
            >
              -1 {category}
            </button>
          </div>
        ))}
      </div>
      <div className="modal-footer">
        <button
          onClick={() => {
            onDelete(player.id);
            onClose();
          }}
          className="btn btn-delete"
        >
          Remove Player
        </button>
        <button onClick={onClose} className="btn btn-close">
          Close
        </button>
      </div>
    </div>
  </div>
);

const PatchNotesPanel = ({ isVisible, onToggle }) => {
  const patchNotes = [
    {
      version: "1.00",
      date: "2024-01-30",
      changes: [
        "Added new performance tracking metrics",
        "Improved KDA calculation algorithm",
        "Fixed bug with vision score tracking",
        "Updated UI for better readability",
        "Added support for multiple regions"
      ]
    },
    {
      version: "13.9",
      date: "2024-01-15",
      changes: [
        "Introduced automated refresh system",
        "Enhanced player statistics display",
        "Added sorting functionality",
        "Fixed player deletion issues",
        "Improved error handling"
      ]
    },
  ];

  return (
    <>
      <button className="patch-notes-toggle" onClick={onToggle}>
        Patch Notes
      </button>
      <div className={`patch-notes-panel ${isVisible ? 'visible' : ''}`}>
        <h2 className="patch-notes-title"></h2>
        <div className="patch-notes-content">
          {patchNotes.map((patch, index) => (
            <div key={index} className="patch-note">
              <h3 className="patch-version">Version {patch.version}</h3>
              <p className="patch-date">{patch.date}</p>
              <ul className="patch-changes">
                {patch.changes.map((change, changeIndex) => (
                  <li key={changeIndex}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const LeaguePerformanceTracker = () => {
  const [playerNameandTag, setPlayerNameandTag] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState(null); // Track loading state for player refresh
  const [isAddingPlayer, setIsAddingPlayer] = useState(false); // Track add player loading state
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
    fetchPlayers(); // Load initial players
    const intervalId = setInterval(updateLastGames, 15 * 60 * 1000); // Update every 15 minutes
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

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
      const response = await axios.get(`http://localhost:5000/update-last-game/${playerId}`);
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

  return (
    <div className="app-container">
    <PatchNotesPanel 
      isVisible={isPatchNotesVisible} 
      onToggle={() => setIsPatchNotesVisible(!isPatchNotesVisible)} 
    />
      <div className="main-content">
        <div className="w-screen h-screen">
          <h1 className="main-header">League Performance Tracker</h1>

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
        </div>
      </div>
    </div>
  );
};

export default LeaguePerformanceTracker;

