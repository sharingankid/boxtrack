const express = require('express');
const wodController = require('../controllers/wodController');
const scoreController = require('../controllers/scoreController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', wodController.create);
router.put('/:id', wodController.update);
router.delete('/:id', wodController.remove);
router.post('/:id/duplicate', wodController.duplicate);
router.post('/:id/scores', scoreController.create);

module.exports = router;
