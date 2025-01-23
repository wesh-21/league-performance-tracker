import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { X, Plus, Minus } from 'lucide-react';
import CloseButton from './CloseButton';

const LeaguePerformanceTracker = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [modalState, setModalState] = useState(null);
  const CATEGORIES = ['Overall', 'Vision Score', 'Damage', 'Gold Earned', 'KDA', 'CS'];

  const addPlayer = () => {
    if (newPlayerName && !players.some(p => p.name === newPlayerName)) {
      setPlayers([
        ...players,
        { name: newPlayerName, points: CATEGORIES.reduce((obj, cat) => ({ ...obj, [cat]: 0 }), {}) }
      ]);
      setNewPlayerName('');
    }
  };

  const addPoint = (playerName, category) => {
    setPlayers(players.map(player => (
      player.name === playerName
        ? { ...player, points: { ...player.points, [category]: player.points[category] + 1 } }
        : player
    )));
  };

  const removePoints = (playerName, category, pointsToRemove) => {
    setPlayers(players.map(player => (
      player.name === playerName
        ? { ...player, points: { ...player.points, [category]: Math.max(player.points[category] - pointsToRemove, 0) } }
        : player
    )));
  };

  const removePlayer = (playerIndex) => {
    setPlayers(players.filter((_, index) => index !== playerIndex));
  };

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

  const PointManagementModal = ({ player, onClose }) => {
    const [stage, setStage] = useState('action');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const modalCategories = ['Vision Score', 'Damage', 'Gold Earned', 'KDA', 'CS'];

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
                  onClick={() => removePlayer(players.findIndex(p => p.name === player.name))}
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
                {modalCategories.map(category => (
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
    <div className="max-w-[600px] mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">League Performance Tracker</h1>

      <div className="mb-5">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
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

      <div className="mb-5">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`mr-2 px-3 py-1 rounded ${
              selectedCategory === category 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">{selectedCategory} Leaderboard</h2>
        <BarChart width={600} height={400} data={getPlayerPoints()}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Bar dataKey="points" fill="#8884d8" />
        </BarChart>
        {getPlayerPoints().map((player, index) => (
            <div 
            key={player.name}
            className="flex justify-between items-center mb-2"
            >
            <div 
                onClick={() => setModalState(player)}
                className={`cursor-pointer flex-grow flex justify-between items-center hover:bg-gray-100 p-2 rounded ${
                modalState?.name === player.name ? 'text-blue-500' : ''
                }`}
            >
                <span>{index + 1}. {player.name}</span>
                <span> {player.points} points</span>
            </div>
            </div>
        ))}
      </div>

      {modalState && (
        <PointManagementModal 
          player={modalState} 
          onClose={() => setModalState(null)} 
        />
      )}
    </div>
  );
};

export default LeaguePerformanceTracker;