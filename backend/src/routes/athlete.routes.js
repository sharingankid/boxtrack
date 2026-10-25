const express = require('express');
const athleteController = require('../controllers/athleteController');

const router = express.Router();

router.get('/:id/photo', athleteController.getPhoto);

module.exports = router;
