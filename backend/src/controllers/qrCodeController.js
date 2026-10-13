const qrCodeService = require('../services/qrCodeService');

async function list(req, res, next) {
  try {
    res.status(200).json({ qr_codes: await qrCodeService.list() });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const qr_code = await qrCodeService.create(req.body, req.user.id);
    res.status(201).json({ qr_code });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const qr_code = await qrCodeService.update(req.params.id, req.body);
    res.status(200).json({ qr_code });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await qrCodeService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
