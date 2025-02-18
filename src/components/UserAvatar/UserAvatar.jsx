import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../main';



const UserAvatar = () => {
  const [avatar, setAvatar] = useState(null);
  const { id: userId, authToken, username } = useUser();
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

  useEffect(() => {
    console.log('Avatar changed:');
    console.log(`/assets/summonerIcons/${avatar}`);
  }, [avatar]);  // Runs only when avatar changes

  return (
    <div className="fixed top-4 right-4 z-50">
    <div className="relative group">
        <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
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
    </div>
    </div>

  );
};

export default UserAvatar;