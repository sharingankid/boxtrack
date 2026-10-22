const express = require('express');
const announcementController = require('../controllers/announcementController');

const router = express.Router();

router.get('/', announcementController.listPublic);
router.get('/:id', announcementController.getPublic);

module.exports = router;
