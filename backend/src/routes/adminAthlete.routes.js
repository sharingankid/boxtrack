const express = require('express');
const athleteController = require('../controllers/athleteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', athleteController.list);
router.post('/', athleteController.create);
router.put('/:id', athleteController.update);

module.exports = router;
