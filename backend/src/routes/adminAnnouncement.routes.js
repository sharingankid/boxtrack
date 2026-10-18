const express = require('express');
const announcementController = require('../controllers/announcementController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', announcementController.listAll);
router.post('/', announcementController.create);
router.put('/:id', announcementController.update);
router.delete('/:id', announcementController.remove);

module.exports = router;
