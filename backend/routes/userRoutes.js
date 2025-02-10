import express from 'express';
import {
    getFriendships,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    getUserId,
    getFriends,
    getFriendRequests,
    getFriendRequestsSent
} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authentication
//router.use(authenticateJWT);

router.get('/user', getUserId);

// Friendship routes
router.get('/friendships/:userId', getFriendships);
router.post('/friendships/request', sendFriendRequest);
router.put('/friendships/:friendshipId/accept', acceptFriendRequest);
router.delete('/friendships/:friendshipId', rejectFriendRequest);
router.get('/friends/:userId', getFriends);
router.get('/friend-requests/:userId', getFriendRequests);
router.get('/friend-requests-sent/:userId', getFriendRequestsSent);

// User search route
router.get('/search', searchUsers);

export default router;