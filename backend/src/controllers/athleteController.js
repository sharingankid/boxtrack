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

module.exports = { list, create, update };
