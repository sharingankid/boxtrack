const express = require('express');
const authRoutes = require('./auth.routes');
const wodRoutes = require('./wod.routes');
const adminWodRoutes = require('./adminWod.routes');
const adminAthleteRoutes = require('./adminAthlete.routes');
const adminScoreRoutes = require('./adminScore.routes');
const announcementRoutes = require('./announcement.routes');
const adminAnnouncementRoutes = require('./adminAnnouncement.routes');
const qrCodeRoutes = require('./qrCode.routes');
const adminQrCodeRoutes = require('./adminQrCode.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wods', wodRoutes);
router.use('/admin/wods', adminWodRoutes);
router.use('/admin/athletes', adminAthleteRoutes);
router.use('/admin/scores', adminScoreRoutes);
router.use('/announcements', announcementRoutes);
router.use('/admin/announcements', adminAnnouncementRoutes);
router.use('/qrcodes', qrCodeRoutes);
router.use('/admin/qrcodes', adminQrCodeRoutes);

module.exports = router;
