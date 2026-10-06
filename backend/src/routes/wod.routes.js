const express = require('express');
const wodController = require('../controllers/wodController');

const router = express.Router();

router.get('/today', wodController.getToday);
router.get('/', wodController.list);
router.get('/:id', wodController.getById);

module.exports = router;
