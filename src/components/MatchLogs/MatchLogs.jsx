import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MatchLogs.module.css'; // Import custom CSS

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const MatchLogs = ({ playerId, playerName, onClose }) => {
    const [matchLogs, setMatchLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchMatchLogs = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${BACKEND_URL}/api/players/match-logs/${playerId}`);
          console.log("Match logs response:", response.data.categories);
          setMatchLogs(response.data.categories);
        } catch (err) {
          setError('Failed to load match logs');
          console.error('Error fetching match logs:', err);
        } finally {
          setLoading(false);
        }
      };
  
      if (playerId) {
        fetchMatchLogs();
      }
    }, [playerId]);
  
    if (!playerId) return null;

  
    return (
      <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg overflow-y-auto">
        <div className="border-b p-4 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {playerName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading match history...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : matchLogs.length === 0 ? (
            <div className="text-gray-500 p-4">No match history available</div>
          ) : (
            <div className="space-y-4">
              {matchLogs.map((match, index) => (
                <div 
                  key={index} 
                  className={styles['matchCard']} // Apply the matchCard class for rectangular outline
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={match.WIN ? styles['green-text'] : styles['red-text']}>
                        {match.WIN ? 'Win ' : 'Loss '}
                      </span>
                      <span className={styles['champion']}> {match.CHAMPION} </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className={match.KDA == '1' ? styles['green-text'] : styles['red-text']}>KDA: {match.KDA}</div>
                      <div className={match.VISION_SCORE == '1' ? styles['green-text'] : styles['red-text']}>Vision Score: {match.VISION_SCORE}</div>
                      <div className={match.DAMAGE == '1' ? styles['green-text'] : styles['red-text']}>Damage: {match.DAMAGE}</div>
                      <div className={match.GOLD_EARNED == '1' ? styles['green-text'] : styles['red-text']}>Gold: {match.GOLD_EARNED}</div>
                      <div className={match.CS == '1' ? styles['green-text'] : styles['red-text']}>CS: {match.CS}</div>
                      <div className={styles['date']}> 
                        {new Date(match.DATE).toLocaleDateString('en-GB')}  &nbsp;
                        {new Date(match.DATE).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
};
  
export default MatchLogs;
