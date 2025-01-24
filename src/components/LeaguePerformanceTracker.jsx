import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import CloseButton from './CloseButton'; // Assuming you have a CloseButton component

const LeaguePerformanceTracker = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [modalState, setModalState] = useState(null);
  const CATEGORIES = ['Overall', 'Vision Score', 'Damage', 'Gold Earned', 'KDA', 'CS'];

  // Add a new player to the list
  const addPlayer = () => {
    if (newPlayerName && !players.some(p => p.name === newPlayerName)) {
      setPlayers([
        ...players,
        { name: newPlayerName, points: CATEGORIES.reduce((obj, cat) => ({ ...obj, [cat]: 0 }), {}) }
      ]);
      setNewPlayerName('');
    }
  };

  // Remove a player from the list
  const removePlayer = (playerName) => {
    setPlayers(players.filter(player => player.name !== playerName));
  };

  // Add points to a player
  const addPoint = (playerName, category) => {
    setPlayers(players.map(player => (
      player.name === playerName
        ? { ...player, points: { ...player.points, [category]: player.points[category] + 1 } }
        : player
    )));
  };

  // Remove points from a player
  const removePoints = (playerName, category, pointsToRemove) => {
    setPlayers(players.map(player => (
      player.name === playerName
        ? { ...player, points: { ...player.points, [category]: Math.max(player.points[category] - pointsToRemove, 0) } }
        : player
    )));
  };

  // Get player points based on selected category
  const getPlayerPoints = () => {
    if (selectedCategory === 'Overall') {
      return players.map(player => ({
        name: player.name,
        points: Object.values(player.points).reduce((sum, points) => sum + points, 0)
      })).sort((a, b) => b.points - a.points);
    }

    return players.map(player => ({
      name: player.name,
      points: player.points[selectedCategory]
    })).sort((a, b) => b.points - a.points);
  };

  // Modal for adding/removing points
  const PointManagementModal = ({ player, onClose, removePlayer }) => {
    const [stage, setStage] = useState('action');
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          {stage === 'action' && (
            <div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setStage('add')} 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Points
                </button>
                <button 
                  onClick={() => setStage('remove')} 
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Remove Points
                </button>
                <button 
                  onClick={() => removePlayer(player.name)} // Pass removePlayer to the button
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove Player
                </button>
                <CloseButton onClick={onClose} />
              </div>
            </div>
          )}

          {(stage === 'add' || stage === 'remove') && (
            <div>
              <h2 className="text-xl font-bold mb-4">{stage === 'add' ? 'Add' : 'Remove'} Points</h2>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.slice(1).map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      stage === 'add' 
                        ? addPoint(player.name, category) 
                        : removePoints(player.name, category, 1);
                      onClose();
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                  >
                    {stage === 'add' ? '+1 ' : '-1 '}{category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen h-screen">
      <h1>League Performance Tracker</h1>

      {/* Add Player Section */}
      <div>
        <input
          type="text"
          placeholder="Enter player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {/* Tabs */}
      <div className="tab-buttons">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={category === selectedCategory ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bar-chart-container">
        <h2>{selectedCategory} Leaderboard</h2>
        <BarChart
          width={Math.min(window.innerWidth * 0.9, 600)} // Responsive width
          height={Math.min(window.innerHeight * 0.5, 400)} // Responsive height
          data={getPlayerPoints()}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="points" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Player List */}
      <div>
        {getPlayerPoints().map((player, index) => (
          <div 
            key={player.name}
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => setModalState(player)}
          >
            <span
            style={{ color: modalState?.name === player.name ? 'blue' : 'black' }}
            >
              {index + 1}. {player.name}
            </span> 
            <span> {player.points} points</span>
          </div>
        ))}
      </div>

      {/* Modal for managing player points */}
      {modalState && (
        <PointManagementModal 
          player={modalState} 
          onClose={() => setModalState(null)} 
          removePlayer={removePlayer} // Pass removePlayer to the modal
        />
      )}
    </div>
  );
};

export default LeaguePerformanceTracker;
