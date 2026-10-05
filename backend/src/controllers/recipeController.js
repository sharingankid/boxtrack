const recipeService = require('../services/recipeService');

async function search(req, res, next) {
  try {
    const results = await recipeService.search(req.query.query);
    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    res.status(200).json({ recipes: await recipeService.list() });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    res.status(200).json({ recipe: await recipeService.getById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const recipe = await recipeService.create(req.body, req.user.id);
    res.status(201).json({ recipe });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const recipe = await recipeService.update(req.params.id, req.body);
    res.status(200).json({ recipe });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await recipeService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { search, list, getById, create, update, remove };
