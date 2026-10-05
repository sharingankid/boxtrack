const wodService = require('../services/wodService');

async function getToday(req, res, next) {
  try {
    res.status(200).json({ wods: await wodService.getToday() });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    res.status(200).json({ wod: await wodService.getById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { from, to } = req.query;
    res.status(200).json({ wods: await wodService.list({ from, to }) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const wod = await wodService.create(req.body, req.user.id);
    res.status(201).json({ wod });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const wod = await wodService.update(req.params.id, req.body);
    res.status(200).json({ wod });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await wodService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getToday, getById, list, create, update, remove };
