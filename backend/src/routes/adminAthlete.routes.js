const express = require('express');
const athleteController = require('../controllers/athleteController');
const { MAX_PHOTO_BYTES } = require('../services/athleteService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// The photo is sent as the raw request body (what a phone's file input
// gives directly), not as JSON/base64 or multipart.
const rawImage = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_PHOTO_BYTES });

router.use(requireAuth);
router.get('/', athleteController.list);
router.post('/', athleteController.create);
router.put('/:id', athleteController.update);
router.put('/:id/photo', rawImage, athleteController.setPhoto);
router.delete('/:id/photo', athleteController.removePhoto);

module.exports = router;
