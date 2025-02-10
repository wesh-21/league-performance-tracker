import React, { useState, useEffect } from 'react';
import { 
  getFriends, 
  getFriendRequests, 
  getFriendRequestsSent, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  searchUsers 
} from '../../services/FriendshipService.js';
import { useUser } from '../../main';
import styles from './FriendsPanel.module.css';

const FriendsPanel = () => {
  const { id: userId, authToken: token } = useUser();
  console.log("FriendsPanel rendered - userId:", userId, "token:", token);

  // State for each group
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [friendUsername, setFriendUsername] = useState("");
  const [error, setError] = useState(null);

  // Fetch all groups when userId and token are available
  useEffect(() => {
    if (userId && token) {
      fetchFriends(userId, token);
      fetchFriendRequests(userId, token);
      fetchFriendRequestsSent(userId, token);
    }
  }, [userId, token]);

  // Wait until user data is loaded
  if (userId === null || token === undefined) {
    return <div>Loading user data...</div>;
  }

  // Fetch accepted friendships
  const fetchFriends = async (userId, token) => {
    try {
      const friendsList = await getFriends(userId, token);
      console.log("Friends loaded:", friendsList);
      setFriends(friendsList);
    } catch (err) {
      setError("Failed to load friends.");
    }
  };

  // Fetch incoming friend requests (pending where user is the receiver)
  const fetchFriendRequests = async (userId, token) => {
    try {
      const requests = await getFriendRequests(userId, token);
      console.log("Friend requests loaded:", requests);
      setFriendRequests(requests);
    } catch (err) {
      setError("Failed to load friend requests.");
    }
  };

  // Fetch sent friend requests (pending where user is the sender)
  const fetchFriendRequestsSent = async (userId, token) => {
    try {
      const requestsSent = await getFriendRequestsSent(userId, token);
      console.log("Friend requests sent loaded:", requestsSent);
      setFriendRequestsSent(requestsSent);
    } catch (err) {
      setError("Failed to load sent friend requests.");
    }
  };

  // Handle sending a new friend request
  const handleSendFriendRequest = async () => {
    if (!friendUsername) return;
    try {
      await sendFriendRequest(userId, friendUsername, token);
      alert("Friend request sent!");
      setFriendUsername("");
      // Refresh friends and sent requests
      fetchFriends(userId, token);
      fetchFriendRequestsSent(userId, token);
    } catch (err) {
      setError("Error sending friend request.");
    }
  };

  // Accept an incoming friend request
  const handleAcceptRequest = async (friendshipId) => {
    if (!userId) {
      setError("User ID is missing!");
      return;
    }
    try {
      await acceptFriendRequest(friendshipId, userId, token);
      // Refresh friends and incoming requests
      fetchFriendRequests(userId, token);
      fetchFriends(userId, token);
    } catch (err) {
      setError("Error accepting friend request.");
    }
  };

  // Reject an incoming friend request
  const handleRejectRequest = async (friendshipId) => {
    try {
      await rejectFriendRequest(friendshipId, userId, token);
      // Refresh incoming and sent friend requests
      fetchFriendRequests(userId, token);
      fetchFriendRequestsSent(userId, token);
    } catch (err) {
      setError("Error rejecting friend request.");
    }
  };

  // Search users
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsers(query, token);
      setSearchResults(results);
    } catch (err) {
      setError("Error searching for users.");
    }
  };

  return (
    <div className={styles.friendsPanel}>
      <h2>Friends</h2>
      {friends.length > 0 ? (
        <ul className={styles.friendList}>
          {friends.map((friend) => (
            <li key={friend.id} className={styles.friendItem}>
              <p>
                <strong>{friend.username}</strong>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no friends yet.</p>
      )}

      <h2>Friend Requests</h2>
      {friendRequests.length > 0 ? (
        <ul className={styles.friendList}>
          {friendRequests.map((req) => (
            <li key={req.id} className={styles.friendItem}>
              <p>
                <strong>{req.sender_username}</strong>
              </p>
              <button onClick={() => handleAcceptRequest(req.id)}>Accept</button>
              <button onClick={() => handleRejectRequest(req.id)}>Reject</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No incoming friend requests.</p>
      )}

      <h2>Sent Friend Requests</h2>
      {friendRequestsSent.length > 0 ? (
        <ul className={styles.friendList}>
          {friendRequestsSent.map((req) => (
            <li key={req.id} className={styles.friendItem}>
              <p>
                <strong>{req.receiver_username}</strong>
              </p>
              <span>Status: {req.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No sent friend requests.</p>
      )}

      <h3>Add a Friend</h3>
      <input
        type="text"
        placeholder="Enter friend's username"
        value={friendUsername}
        onChange={(e) => setFriendUsername(e.target.value)}
      />
      <button onClick={handleSendFriendRequest}>Send Friend Request</button>

      <h3>Search Users</h3>
      <input
        type="text"
        placeholder="Search for a user..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchResults.length > 0 && (
        <ul className={styles.searchResults}>
          {searchResults.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FriendsPanel;
