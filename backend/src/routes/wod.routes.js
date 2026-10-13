const express = require('express');
const wodController = require('../controllers/wodController');
const scoreController = require('../controllers/scoreController');

const router = express.Router();

router.get('/today', wodController.getToday);
router.get('/', wodController.list);
router.get('/:id', wodController.getById);
router.get('/:id/leaderboard', scoreController.getLeaderboard);

module.exports = router;
