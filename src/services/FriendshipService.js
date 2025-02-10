import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

/**
 * Fetch all friendships for the logged-in user.
 * (May return both accepted and pending requests.)
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} token - JWT authentication token.
 */
export const getFriendships = async (userId, token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/friendships/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching friendships:", error);
        throw error;
    }
};

/**
 * Fetch accepted friends for the logged-in user.
 * (Returns friendships where status is 'accepted'.)
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} token - JWT authentication token.
 */
export const getFriends = async (userId, token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/friends/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching friends:", error);
        throw error;
    }
};

/**
 * Fetch incoming friend requests (pending) where the logged-in user is the receiver.
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} token - JWT authentication token.
 */
export const getFriendRequests = async (userId, token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/friend-requests/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        throw error;
    }
};

/**
 * Fetch sent friend requests (pending) where the logged-in user is the sender.
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} token - JWT authentication token.
 */
export const getFriendRequestsSent = async (userId, token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/friend-requests-sent/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sent friend requests:", error);
        throw error;
    }
};

/**
 * Send a friend request by username.
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} friendUsername - The username of the friend.
 * @param {string} token - JWT authentication token.
 */
export const sendFriendRequest = async (userId, friendUsername, token) => {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/users/friendships/request`,
            { userId, friendUsername },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending friend request:", error);
        throw error;
    }
};

/**
 * Accept a friend request.
 * @param {string} friendshipId - The ID of the friendship request.
 * @param {string} userId - The ID of the user accepting the request.
 * @param {string} token - JWT authentication token.
 */
export const acceptFriendRequest = async (friendshipId, userId, token) => {
    try {
        const response = await axios.put(
            `${BACKEND_URL}/users/friendships/${friendshipId}/accept`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Friend request accepted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error accepting friend request:", error);
        throw error;
    }
};

/**
 * Reject or remove a friend request.
 * @param {string} friendshipId - The ID of the friendship request.
 * @param {string} userId - The ID of the user rejecting the request.
 * @param {string} token - JWT authentication token.
 */
export const rejectFriendRequest = async (friendshipId, userId, token) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/users/friendships/${friendshipId}`, {
            data: { userId },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error rejecting/removing friend request:", error);
        throw error;
    }
};

/**
 * Search for users by username.
 * @param {string} query - The search query (username or partial).
 * @param {string} token - JWT authentication token.
 */
export const searchUsers = async (query, token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/search?query=${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};

/**
 * Get the user ID of the currently authenticated user.
 * @param {string} token - JWT authentication token.
 */
export const getUserId = async (token) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting user ID:", error);
        throw error;
    }
};
