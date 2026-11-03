const athleteService = require('../services/athleteService');

async function list(req, res, next) {
  try {
    res.status(200).json({ athletes: await athleteService.list(req.query) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const athlete = await athleteService.create(req.body, req.user.id);
    res.status(201).json({ athlete });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const athlete = await athleteService.update(req.params.id, req.body);
    res.status(200).json({ athlete });
  } catch (err) {
    next(err);
  }
}

async function setPhoto(req, res, next) {
  try {
    const athlete = await athleteService.setPhoto(req.params.id, req.body);
    res.status(200).json({ athlete });
  } catch (err) {
    next(err);
  }
}

async function removePhoto(req, res, next) {
  try {
    await athleteService.removePhoto(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Public: the leaderboard (public page, TV) shows athletes by name already.
// The URL is versioned (?v=<upload time>, see athleteModel), so it can be
// cached for good. Cross-origin allowed so a front served from another
// domain can still use it in an <img>.
async function getPhoto(req, res, next) {
  try {
    const photo = await athleteService.getPhoto(req.params.id);
    res.set({
      'Content-Type': photo.content_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.status(200).send(photo.data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, setPhoto, removePhoto, getPhoto };
