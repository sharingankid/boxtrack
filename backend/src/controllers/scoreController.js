const scoreService = require('../services/scoreService');

async function getLeaderboard(req, res, next) {
  try {
    res.status(200).json(await scoreService.getLeaderboard(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const score = await scoreService.recordScore(req.params.id, req.body, req.user.id);
    res.status(201).json({ score });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await scoreService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard, create, remove };
