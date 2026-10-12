const ApiError = require('../utils/ApiError');

const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const INFO_BASE_URL = 'https://api.spoonacular.com/recipes';

function mapResult(result) {
  const calories = result.nutrition?.nutrients?.find((n) => n.name === 'Calories')?.amount;
  return {
    spoonacular_id: result.id,
    name: result.title,
    calorie: calories ? Math.round(calories) : 0,
    image_url: result.image || null,
    categories: result.dishTypes || [],
  };
}

// Server-side only - the API key never reaches the client. Returns
// ready-to-save recipe shapes so the admin's follow-up POST /admin/recipes
// doesn't need a second call back to Spoonacular.
async function searchRecipes(query) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'MISSING_API_KEY', 'SPOONACULAR_API_KEY is not configured on the server');
  }
  if (!query) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'query is required');
  }

  const url = new URL(BASE_URL);
  url.search = new URLSearchParams({
    apiKey,
    query,
    number: '10',
    addRecipeInformation: 'true',
    addRecipeNutrition: 'true',
  }).toString();

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new ApiError(502, 'SPOONACULAR_UNREACHABLE', `Could not reach Spoonacular: ${err.message}`);
  }

  if (!response.ok) {
    throw new ApiError(502, 'SPOONACULAR_ERROR', `Spoonacular returned status ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map(mapResult);
}

// complexSearch never returns ingredients (even with addRecipeInformation),
// only GET /recipes/{id}/information does - fetched on demand at import
// time (one call per saved recipe, not per search result) to avoid burning
// quota on results the coach never saves.
async function getIngredients(spoonacularId) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'MISSING_API_KEY', 'SPOONACULAR_API_KEY is not configured on the server');
  }

  const url = new URL(`${INFO_BASE_URL}/${spoonacularId}/information`);
  url.search = new URLSearchParams({ apiKey }).toString();

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new ApiError(502, 'SPOONACULAR_UNREACHABLE', `Could not reach Spoonacular: ${err.message}`);
  }

  if (!response.ok) {
    throw new ApiError(502, 'SPOONACULAR_ERROR', `Spoonacular returned status ${response.status}`);
  }

  const data = await response.json();
  return (data.extendedIngredients || []).map((ingredient) => ({
    name: ingredient.name,
    detail: ingredient.original || null,
  }));
}

module.exports = { searchRecipes, mapResult, getIngredients };
