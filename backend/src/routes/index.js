const express = require('express');
const authRoutes = require('./auth.routes');
const wodRoutes = require('./wod.routes');
const adminWodRoutes = require('./adminWod.routes');
const recipeRoutes = require('./recipe.routes');
const adminRecipeRoutes = require('./adminRecipe.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wods', wodRoutes);
router.use('/admin/wods', adminWodRoutes);
router.use('/recipes', recipeRoutes);
router.use('/admin/recipes', adminRecipeRoutes);

module.exports = router;
