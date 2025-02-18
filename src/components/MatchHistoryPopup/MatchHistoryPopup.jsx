import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const MatchHistoryPopup = ({ playerId, playerName, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/players/match-logs/${playerId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
        );
        const matchData = response.data.categories || [];
        setMatches(matchData);
        setIsLoading(false);
        // Trigger animation after data is loaded
        setTimeout(() => setIsVisible(true), 50);
      } catch (error) {
        console.error("Error fetching match history:", error);
        setIsLoading(false);
      }
    };
    fetchMatchHistory();

    return () => setIsVisible(false);
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  return (
    <div 
      className={`absolute top-[6vh] left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-10 text-white p-6 w-[45vh] max-w-2xl 
        bg-gray-900/95 rounded-2xl shadow-2xl backdrop-blur-sm 
        transition-all duration-300 ease-in-out transform
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <div className="top-0 overflow-hidden p-4 rounded-xl">
        <div className="flex justify-between items-center w-full mb-6">
          <h2 className="text-xl font-bold text-white text-center flex-1 tracking-wide">
            {playerName}'s Match History
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 ease-in-out"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
        <div className="flex flex-col justify-between items-center overflow-auto mt-4 h-[70vh] space-y-3 pr-2">
          {matches.map((match, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${match.WIN ? 'bg-green-900/40' : 'bg-red-900/40'} 
                transition-all duration-200 hover:scale-102 hover:shadow-lg w-full
                border border-opacity-10 ${match.WIN ? 'border-green-400' : 'border-red-400'}`}
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base tracking-wide">{match.CHAMPION}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${match.WIN ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {match.WIN ? 'Victory' : 'Defeat'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{formatTimestamp(match.DATE)}</div>
              </div>
             
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/40 p-2 rounded-lg text-center">
                  <div className="text-gray-400 mb-1">KDA</div>
                  <div className="font-semibold">{match.kda}</div>
                </div>
                <div className="bg-gray-800/40 p-2 rounded-lg text-center">
                  <div className="text-gray-400 mb-1">CS</div>
                  <div>{match.cs}</div>
                </div>
                <div className="bg-gray-800/40 p-2 rounded-lg text-center">
                  <div className="text-gray-400 mb-1">Vision</div>
                  <div>{match.vision_score}</div>
                </div>
                <div className="bg-gray-800/40 p-2 rounded-lg text-center">
                  <div className="text-gray-400 mb-1">Damage</div>
                  <div>{match.damage.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800/40 p-2 rounded-lg text-center col-span-2">
                  <div className="text-gray-400 mb-1">Gold</div>
                  <div>{match.gold_earned.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MatchHistoryPopup;