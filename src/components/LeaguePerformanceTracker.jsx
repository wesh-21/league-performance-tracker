import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const LeaguePerformanceTracker = () => {
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [activeTab, setActiveTab] = useState("Overall");

  // Add player to the list
  const addPlayer = () => {
    if (playerName.trim() && !players.includes(playerName)) {
      setPlayers([...players, playerName]);
      setPlayerName("");
    }
  };

  // Simulate player points data
  const getPlayerPoints = () => {
    return players.map((player, index) => ({
      name: player,
      points: Math.floor(Math.random() * 100), // Random points
    }));
  };

  // Tab buttons data
  const tabs = ["Overall", "Vision Score", "Damage", "Gold Earned", "KDA", "CS"];

  return (
    <div className="w-screen h-screen">
      <h1>League Performance Tracker</h1>

      {/* Add Player Section */}
      <div>
        <input
          type="text"
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {/* Tabs */}
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bar-chart-container">
        <h2>{activeTab} Leaderboard</h2>
        <BarChart
          width={Math.min(window.innerWidth * 0.9, 600)} // Responsive width
          height={Math.min(window.innerHeight * 0.5, 400)} // Responsive height
          data={getPlayerPoints()}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="points" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default LeaguePerformanceTracker;
