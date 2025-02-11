import pool from '../models/database.js';
import jwt from 'jsonwebtoken';

export const getFriendships = async (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT 
            f.id,
            f.status,
            f.created_at,
            CASE 
                WHEN f.user_id1 = $1 THEN u2.username
                ELSE u1.username
            END as username,
            CASE 
                WHEN f.user_id1 = $1 THEN f.user_id2
                ELSE f.user_id1
            END as friend_id
        FROM friendships f
        JOIN users u1 ON f.user_id1 = u1.id
        JOIN users u2 ON f.user_id2 = u2.id
        WHERE f.user_id1 = $1 OR f.user_id2 = $1`;

    try {
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get friendships' });
    }
};

export const getFriends = async (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT 
            f.id,
            f.status,
            f.created_at,
            CASE 
                WHEN f.user_id1 = $1 THEN u2.username
                ELSE u1.username
            END AS username,
            CASE 
                WHEN f.user_id1 = $1 THEN f.user_id2
                ELSE f.user_id1
            END AS friend_id
        FROM friendships f
        JOIN users u1 ON f.user_id1 = u1.id
        JOIN users u2 ON f.user_id2 = u2.id
        WHERE (f.user_id1 = $1 OR f.user_id2 = $1)
            AND f.status = 'accepted'`;

    try {
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error getting friends:", err);
        res.status(500).json({ error: 'Failed to get accepted friendships' });
    }
};

export const getFriendRequests = async (req, res) => {
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
        WHERE f.user_id2 = $1
            AND f.status = 'pending'`;

    try {
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error getting friend requests:", err);
        res.status(500).json({ error: 'Failed to get friend requests' });
    }
};

export const getFriendRequestsSent = async (req, res) => {
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
        WHERE f.user_id1 = $1
            AND f.status = 'pending'`;

    try {
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error getting sent friend requests:", err);
        res.status(500).json({ error: 'Failed to get sent friend requests' });
    }
};

export const sendFriendRequest = async (req, res) => {
    const { userId, friendUsername } = req.body;

    try {
        // Find friend's userId by username
        const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [friendUsername]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const friendId = userResult.rows[0].id;
        console.log("Sending friend request from user ID", userId, "to user ID", friendId);

        // Prevent self-friend requests
        if (userId == friendId) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        // Check if friendship exists
        const existingResult = await pool.query(
            'SELECT * FROM friendships WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1)',
            [userId, friendId]
        );

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Friendship already exists' });
        }

        // Create friendship request
        const insertResult = await pool.query(
            'INSERT INTO friendships (user_id1, user_id2, status) VALUES ($1, $2, $3) RETURNING id',
            [userId, friendId, 'pending']
        );

        res.status(201).json({
            id: insertResult.rows[0].id,
            message: 'Friend request sent successfully'
        });
    } catch (err) {
        console.error("Error sending friend request:", err);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    try {
        // Verify the request exists and user is the recipient
        const friendshipResult = await pool.query(
            'SELECT * FROM friendships WHERE id = $1 AND user_id2 = $2 AND status = $3',
            [friendshipId, userId, 'pending']
        );

        if (friendshipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        // Update friendship status
        await pool.query(
            'UPDATE friendships SET status = $1 WHERE id = $2',
            ['accepted', friendshipId]
        );

        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        console.error("Error accepting friend request:", err);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
};

export const rejectFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    try {
        // Verify the friendship exists
        const friendshipResult = await pool.query(
            'SELECT * FROM friendships WHERE id = $1 AND (user_id1 = $2 OR user_id2 = $2)',
            [friendshipId, userId]
        );

        if (friendshipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Friendship not found' });
        }

        // Delete the friendship
        await pool.query('DELETE FROM friendships WHERE id = $1', [friendshipId]);
        res.json({ message: 'Friendship removed successfully' });
    } catch (err) {
        console.error("Error rejecting friend request:", err);
        res.status(500).json({ error: 'Failed to remove friendship' });
    }
};

export const searchUsers = async (req, res) => {
    const { query } = req.query;

    try {
        const { rows } = await pool.query(
            'SELECT id, username FROM users WHERE username LIKE $1 LIMIT 10',
            [`${query}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error searching users:", err);
        res.status(500).json({ error: 'Failed to search users' });
    }
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