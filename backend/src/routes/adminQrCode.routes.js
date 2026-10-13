const express = require('express');
const qrCodeController = require('../controllers/qrCodeController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', qrCodeController.create);
router.put('/:id', qrCodeController.update);
router.delete('/:id', qrCodeController.remove);

module.exports = router;
