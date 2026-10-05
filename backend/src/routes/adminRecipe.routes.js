const express = require('express');
const recipeController = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/search', recipeController.search);
router.post('/', recipeController.create);
router.put('/:id', recipeController.update);
router.delete('/:id', recipeController.remove);

module.exports = router;
