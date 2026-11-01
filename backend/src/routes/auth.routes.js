const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const loginRateLimiter = require('../middleware/loginRateLimiter');

const router = express.Router();

router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
