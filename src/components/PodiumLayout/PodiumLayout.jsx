import React from 'react';
import { Crown } from 'lucide-react';

const PodiumLayout = ({ 
  sortedPlayers, 
  selectedCategory,
  setSelectedMatchHistory,
  formatScore,
  getScoreForCategory,
  getScoreChange,
  ScoreChangeIndicator 
}) => {
  return (
    <div className="flex justify-center items-end gap-4 md:gap-6 lg:gap-8">
      {/* Second Place */}
      <div className="w-24 md:w-32 lg:w-40 text-center mb-4 transform hover:scale-105 transition-transform">
        <div
          className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-2 ring-blue-300 cursor-pointer"
          onClick={() => setSelectedMatchHistory(sortedPlayers[1])}
        >
          <img
            src={sortedPlayers[1]?.summoner_icon}
            alt={sortedPlayers[1]?.name}
            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="text-sm truncate px-1 md:px-2">{sortedPlayers[1]?.name}</div>
        <div className="font-bold flex items-center justify-center gap-1">
          <span className="truncate">
            {formatScore(getScoreForCategory(sortedPlayers[1]), selectedCategory)}
          </span>
          <ScoreChangeIndicator change={getScoreChange(sortedPlayers[1])} />
        </div>
      </div>

      {/* First Place */}
      <div className="w-28 md:w-36 lg:w-44 text-center mb-4 transform hover:scale-110 transition-transform">
        <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-bounce" />
        <div
          className="w-20 h-20 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-4 ring-yellow-500 cursor-pointer"
          onClick={() => setSelectedMatchHistory(sortedPlayers[0])}
        >
          <img
            src={sortedPlayers[0]?.summoner_icon}
            alt={sortedPlayers[0]?.name}
            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="text-sm truncate px-1 md:px-2">{sortedPlayers[0]?.name}</div>
        <div className="font-bold flex items-center justify-center gap-1">
          <span className="truncate">
            {formatScore(getScoreForCategory(sortedPlayers[0]), selectedCategory)}
          </span>
          <ScoreChangeIndicator change={getScoreChange(sortedPlayers[0])} />
        </div>
      </div>

      {/* Third Place */}
      <div className="w-24 md:w-32 lg:w-40 text-center mb-4 transform hover:scale-105 transition-transform">
        <div
          className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 overflow-hidden ring-2 ring-orange-300 cursor-pointer"
          onClick={() => setSelectedMatchHistory(sortedPlayers[2])}
        >
          <img
            src={sortedPlayers[2]?.summoner_icon}
            alt={sortedPlayers[2]?.name}
            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="text-sm truncate px-1 md:px-2">{sortedPlayers[2]?.name}</div>
        <div className="font-bold flex items-center justify-center gap-1">
          <span className="truncate">
            {formatScore(getScoreForCategory(sortedPlayers[2]), selectedCategory)}
          </span>
          <ScoreChangeIndicator change={getScoreChange(sortedPlayers[2])} />
        </div>
      </div>
    </div>
  );
};

export default PodiumLayout;