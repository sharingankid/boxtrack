const express = require('express');
const memberController = require('../controllers/memberController');
const { requireMember } = require('../middleware/memberAuth');
const loginRateLimiter = require('../middleware/loginRateLimiter');

const router = express.Router();

// Sign-up and login are public writes: same per-IP limit as the staff login.
router.post('/register', loginRateLimiter, memberController.register);
router.post('/login', loginRateLimiter, memberController.login);
router.post('/logout', requireMember, memberController.logout);
router.get('/me', requireMember, memberController.me);
router.get('/me/scores', requireMember, memberController.listScores);
router.post('/me/scores', requireMember, memberController.submitScore);

module.exports = router;
