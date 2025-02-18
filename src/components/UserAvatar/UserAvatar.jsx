import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../main';
import { LogOut } from 'lucide-react';

const UserAvatar = () => {
  const [avatar, setAvatar] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { id: userId, authToken, username, clearUser } = useUser();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/users/user/avatar/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }
          );
          setAvatar(response.data['avatar']);
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      }
    };
    fetchAvatar();
  }, [userId, authToken, BACKEND_URL]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="fixed top-4 right-4 z-50 user-menu-container">
      <div className="relative group">
        <div 
          className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {avatar ? (
            <img
              src={`/summonerIcons/${avatar}`}
              alt={`${username}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
              {username ? username[0].toUpperCase() : '?'}
            </div>
          )}
        </div>

        {/* Username tooltip on hover */}
        <div className="absolute right-0 mt-2 py-1 px-2 bg-gray-800 text-gray-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          {username || 'Guest'}
        </div>

        {/* Options Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                Signed in as<br />
                <span className="font-medium">{username}</span>
              </div>
              <button
                onClick={() => {
                  clearUser();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;