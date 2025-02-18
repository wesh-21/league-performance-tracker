import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const MatchHistoryPopup = ({ playerId, playerName, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        console.log('Fetching match history for player:', playerId);
        const response = await axios.get(
          `${BACKEND_URL}/api/players/match-logs/${playerId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
        );
        console.log('Match history:', response.data);
        
        const matchData = response.data.categories || [];
        setMatches(matchData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching match history:", error);
        setIsLoading(false);
      }
    };
    fetchMatchHistory();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="fixed top-[50vh] left-1/2 -translate-x-1/2 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
<div className="absolute top-[6vh] left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-10 text-white p-6 w-[45vh] max-w-2xl">
<div className="top-0 overflow-auto p-4">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-bold text-white text-center flex-1">{playerName}'s Match History</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>
        <div className="flex flex-col justify-between items-center overflow-auto mt-4 h-[70vh]">

          {matches.map((match, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${match.WIN ? 'bg-green-900/30' : 'bg-red-900/30'} transition-transform hover:scale-105 w-full`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base">{match.CHAMPION}</span>
                  <span className="text-sm text-gray-400">{match.WIN ? 'Victory' : 'Defeat'}</span>
                </div>
                <div className="text-xs text-gray-400">{formatTimestamp(match.DATE)}</div>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-center">
                <div>
                  <div className="text-gray-400">KDA</div>
                  <div className="font-semibold">{match.kda}</div>
                </div>
                <div>
                  <div className="text-gray-400">CS</div>
                  <div>{match.cs}</div>
                </div>
                <div>
                  <div className="text-gray-400">Vision</div>
                  <div>{match.vision_score}</div>
                </div>
                <div>
                  <div className="text-gray-400">Damage</div>
                  <div>{match.damage.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Gold</div>
                  <div>{match.gold_earned.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchHistoryPopup;
