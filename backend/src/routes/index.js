const express = require('express');
const authRoutes = require('./auth.routes');
const wodRoutes = require('./wod.routes');
const adminWodRoutes = require('./adminWod.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wods', wodRoutes);
router.use('/admin/wods', adminWodRoutes);

module.exports = router;
