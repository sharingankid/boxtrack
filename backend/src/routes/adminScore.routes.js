const express = require('express');
const scoreController = require('../controllers/scoreController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.delete('/:id', scoreController.remove);

module.exports = router;
