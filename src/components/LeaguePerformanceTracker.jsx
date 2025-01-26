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
      const response = await axios.get("http://localhost:5000/players");
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const addPlayer = async (playerName) => {
    if (playerName.trim()) {
      try {
        await axios.post("http://localhost:5000/players", { name: playerName });
        fetchPlayers();
      } catch (error) {
        console.error("Error adding player:", error);
      }
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

const LeaguePerformanceTracker = () => {
  const [playerName, setPlayerName] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { 
    players, 
    fetchPlayers, 
    addPlayer, 
    modifyPlayerPoints, 
    deletePlayer 
  } = usePlayerManagement();

  useEffect(() => {
    fetchPlayers();
  }, []);

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

  const handleAddPlayer = () => {
    addPlayer(playerName);
    setPlayerName("");
  };

  return (
    <div className="w-screen h-screen">
      <h1 className="main-header">League Performance Tracker</h1>

      {/* Add Player Section */}
      <div className="mb-5">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="input-field"
        />
        <button
          onClick={handleAddPlayer}
          className="btn-primary"
        >
          Add Player
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`tab-button ${activeTab === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bar-chart-container">
        <h2>{activeTab} Leaderboard</h2>
        <BarChart width={500} height={400} data={getPlayerPoints()}>
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
          <div
            key={player.id}
            className="player-list-item"
            onClick={() => setSelectedPlayer(players.find(p => p.id === player.id) || null)}
          >
            <span>{player.name}</span>
            <span>{player.points} points</span>
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
  );
};

export default LeaguePerformanceTracker;