const express = require('express');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

router.get('/', recipeController.list);
router.get('/:id', recipeController.getById);

module.exports = router;
