const recipeModel = require('../models/recipeModel');
const spoonacularService = require('./spoonacularService');
const ApiError = require('../utils/ApiError');

async function search(query) {
  return spoonacularService.searchRecipes(query);
}

async function list() {
  return recipeModel.list();
}

async function getById(id) {
  const recipe = await recipeModel.findById(id);
  if (!recipe) {
    throw new ApiError(404, 'NOT_FOUND', 'Recipe not found');
  }
  return recipe;
}

function assertValid(data) {
  if (!data.name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'name is required');
  }
  if (data.calorie === undefined || data.calorie === null || Number.isNaN(Number(data.calorie))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'calorie is required and must be a number');
  }
  if (Number(data.calorie) < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'calorie cannot be negative');
  }
}

async function create(data, userId) {
  assertValid(data);
  return recipeModel.create(data, userId);
}

async function update(id, data) {
  if (data.name !== undefined && !data.name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'name cannot be empty');
  }
  if (data.calorie !== undefined && (Number.isNaN(Number(data.calorie)) || Number(data.calorie) < 0)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'calorie must be a non-negative number');
  }

  const updated = await recipeModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Recipe not found');
  }
  return updated;
}

async function remove(id) {
  const deleted = await recipeModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Recipe not found');
  }
}

module.exports = { search, list, getById, create, update, remove };
