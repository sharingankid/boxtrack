const express = require('express');
const wodController = require('../controllers/wodController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', wodController.create);
router.put('/:id', wodController.update);
router.delete('/:id', wodController.remove);

module.exports = router;
