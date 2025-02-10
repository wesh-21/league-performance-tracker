import db from '../models/database.js';

// Get all friendships for a user, returns an array of friendship objects (id, status, created_at, username, friend_id)
export const getFriendships = (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT 
            f.id,
            f.status,
            f.created_at,
            CASE 
                WHEN f.user_id1 = ? THEN u2.username
                ELSE u1.username
            END as username,
            CASE 
                WHEN f.user_id1 = ? THEN f.user_id2
                ELSE f.user_id1
            END as friend_id
        FROM friendships f
        JOIN users u1 ON f.user_id1 = u1.id
        JOIN users u2 ON f.user_id2 = u2.id
        WHERE f.user_id1 = ? OR f.user_id2 = ?`;

    db.all(query, [userId, userId, userId, userId], (err, friendships) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get friendships' });
        }
        res.json(friendships);
    });
};


export const getFriends = (req, res) => {
    const { userId } = req.params;
  
    const query = `
      SELECT 
        f.id,
        f.status,
        f.created_at,
        CASE 
          WHEN f.user_id1 = ? THEN u2.username
          ELSE u1.username
        END AS username,
        CASE 
          WHEN f.user_id1 = ? THEN f.user_id2
          ELSE f.user_id1
        END AS friend_id
      FROM friendships f
      JOIN users u1 ON f.user_id1 = u1.id
      JOIN users u2 ON f.user_id2 = u2.id
      WHERE (f.user_id1 = ? OR f.user_id2 = ?)
        AND f.status = 'accepted'
    `;
  
    db.all(query, [userId, userId, userId, userId], (err, rows) => {
      if (err) {
        console.error("Error getting friends:", err);
        return res.status(500).json({ error: 'Failed to get accepted friendships' });
      }
      res.json(rows);
    });
  };

  
  export const getFriendRequests = (req, res) => {
    const { userId } = req.params;
  
    const query = `
      SELECT 
        f.id,
        f.status,
        f.created_at,
        u1.username AS sender_username,
        f.user_id1 AS sender_id
      FROM friendships f
      JOIN users u1 ON f.user_id1 = u1.id
      WHERE f.user_id2 = ?
        AND f.status = 'pending'
    `;
  
    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error("Error getting friend requests:", err);
        return res.status(500).json({ error: 'Failed to get friend requests' });
      }
      res.json(rows);
    });
  };

  
  export const getFriendRequestsSent = (req, res) => {
    const { userId } = req.params;
  
    const query = `
      SELECT 
        f.id,
        f.status,
        f.created_at,
        u2.username AS receiver_username,
        f.user_id2 AS receiver_id
      FROM friendships f
      JOIN users u2 ON f.user_id2 = u2.id
      WHERE f.user_id1 = ?
        AND f.status = 'pending'
    `;
  
    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error("Error getting sent friend requests:", err);
        return res.status(500).json({ error: 'Failed to get sent friend requests' });
      }
      res.json(rows);
    });
  };

  
  export const sendFriendRequest = (req, res) => {
    const { userId, friendUsername } = req.body;
  
    // Find friend's userId by username
    db.get(`SELECT id FROM users WHERE username = ?`, [friendUsername], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to find user by username' });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const friendId = row.id;
      console.log("Sending friend request from user ID", userId, "to user ID", friendId);
  
      // Prevent self-friend requests
      if (userId == friendId) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }
  
      // Check if friendship exists
      db.get(
        `SELECT * FROM friendships WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
        [userId, friendId, friendId, userId],
        (err, existing) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to check existing friendship' });
          }
          if (existing) {
            return res.status(400).json({ error: 'Friendship already exists' });
          }
  
          // Create friendship request
          db.run(
            `INSERT INTO friendships (user_id1, user_id2, status) VALUES (?, ?, 'pending')`,
            [userId, friendId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to send friend request' });
              }
              res.status(201).json({
                id: this.lastID,
                message: 'Friend request sent successfully'
              });
            }
          );
        }
      );
    });
  };


export const acceptFriendRequest = (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;
    
    // Verify the request exists and user is the recipient
    db.get(`
        SELECT * FROM friendships 
        WHERE id = ? AND user_id2 = ? AND status = 'pending'`,
        [friendshipId, userId],
        (err, friendship) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to verify friend request' });
            }

            if (!friendship) {
                return res.status(404).json({ error: 'Friend request not found' });
            }

            // Update friendship status
            db.run(`
                UPDATE friendships 
                SET status = 'accepted' 
                WHERE id = ?`,
                [friendshipId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to accept friend request' });
                    }
                    res.json({ message: 'Friend request accepted' });
                }
            );
        }
    );
};

export const rejectFriendRequest = (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;
    
    // Verify the friendship exists
    db.get(`
        SELECT * FROM friendships 
        WHERE id = ? AND (user_id1 = ? OR user_id2 = ?)`,
        [friendshipId, userId, userId],
        (err, friendship) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to verify friendship' });
            }

            if (!friendship) {
                return res.status(404).json({ error: 'Friendship not found' });
            }

            // Delete the friendship
            db.run(`
                DELETE FROM friendships 
                WHERE id = ?`,
                [friendshipId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to remove friendship' });
                    }
                    res.json({ message: 'Friendship removed successfully' });
                }
            );
        }
    );
};

export const searchUsers = (req, res) => {
    const { query } = req.query;
    
    db.all(`
        SELECT id, username
        FROM users
        WHERE username LIKE ?
        LIMIT 10`,
        [`${query}%`],
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to search users' });
            }
            res.json(users);
        }
    );
};

export const getUserId = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Bearer token required" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded?.id) {
            return res.status(401).json({ error: "Invalid token" });
        }

        return res.json({ userId: decoded.id });
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
