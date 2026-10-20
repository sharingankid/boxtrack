const express = require('express');
const qrCodeController = require('../controllers/qrCodeController');

const router = express.Router();

router.get('/', qrCodeController.list);

module.exports = router;
