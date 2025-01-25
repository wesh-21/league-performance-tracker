import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import cosmicBg from "../assets/cosmic_blue.jpg"; // Ensure this file exists

const LeaguePerformanceTracker = () => {
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold Earned", "CS"];

  // Fetch players on load
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/players");
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const addPlayer = async () => {
    if (playerName.trim()) {
      try {
        await axios.post("http://localhost:5000/players", { name: playerName });
        setPlayerName("");
        fetchPlayers();
      } catch (error) {
        console.error("Error adding player:", error);
      }
    }
  };

  const modifyPlayerPoints = async (id, category, value) => {
    const formattedCategory = category.toLowerCase().replace(" ", "_");
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

  const PointManagementModal = ({ player, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Manage Points for {player.name}</h2>
        <div className="modal-grid">
          {CATEGORIES.slice(1).map((category) => (
            <div key={category} className="modal-item">
              <button
                onClick={() => modifyPlayerPoints(player.id, category, 1)}
                className="btn btn-add"
              >
                +1 {category}
              </button>
              <button
                onClick={() => modifyPlayerPoints(player.id, category, -1)}
                className="btn btn-remove"
              >
                -1 {category}
              </button>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button
            onClick={() => deletePlayer(player.id)}
            className="btn btn-delete"
          >
            Remove Player
          </button>
          <button
            onClick={onClose}
            className="btn btn-close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
  
  

  return (
    <div
      className="w-screen h-screen"
    >
      <h1 className="main-header">
        League Performance Tracker
      </h1>

      {/* Add Player Section */}
      <div className="mb-5">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="mr-2 px-2 py-1 border rounded"
        />
        <button
          onClick={addPlayer}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
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
            className={`mr-2 px-3 py-1 rounded ${
              activeTab === category ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div>
        <h2>{activeTab} Leaderboard</h2>
        
        <BarChart width={800} height={400} data={getPlayerPoints()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="points" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Player List */}
      <div>
        {getPlayerPoints().map((player) => (
          <div
            key={player.id}
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => setSelectedPlayer(player)}
          >
            <span>{player.name}</span>
            <span> {player.points} points</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPlayer && (
        <PointManagementModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

export default LeaguePerformanceTracker;
