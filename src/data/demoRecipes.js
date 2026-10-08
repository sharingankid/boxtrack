// Real Spoonacular results (same ones used in backend/db/seed.sql) so the
// demo experience matches what the live API/DB would actually contain.

export const demoRecipes = [
  {
    id: 9001,
    spoonacular_id: 1021260,
    name: 'Simple Protein Pancakes',
    calorie: 147,
    image_url: 'https://img.spoonacular.com/recipes/1021260-312x231.jpg',
    categories: [{ name: 'morning meal' }, { name: 'breakfast' }],
  },
  {
    id: 9002,
    spoonacular_id: 1847920,
    name: 'Healthy Quinoa Salad',
    calorie: 226,
    image_url: 'https://img.spoonacular.com/recipes/1847920-312x231.jpg',
    categories: [{ name: 'salad' }, { name: 'snack' }],
  },
  {
    id: 9003,
    spoonacular_id: 638764,
    name: 'Chipotle Turkey Chili',
    calorie: 549,
    image_url: 'https://img.spoonacular.com/recipes/638764-312x231.jpg',
    categories: [{ name: 'lunch' }, { name: 'dinner' }],
  },
]

// What a coach would see searching Spoonacular from the admin - not yet
// saved to `demoRecipes` above, so "Enregistrer" has something to do.
export const demoSpoonacularResults = [
  {
    spoonacular_id: 644045,
    name: 'Fruity Yogurt Parfait',
    calorie: 95,
    image_url: 'https://img.spoonacular.com/recipes/644045-312x231.jpg',
    categories: ['morning meal', 'breakfast'],
  },
  {
    spoonacular_id: 640828,
    name: 'Crispy Panko and Herb Crusted Salmon',
    calorie: 390,
    image_url: 'https://img.spoonacular.com/recipes/640828-312x231.jpg',
    categories: ['lunch', 'dinner'],
  },
  {
    spoonacular_id: 715397,
    name: 'Cheesy Chicken and Rice Casserole',
    calorie: 464,
    image_url: 'https://img.spoonacular.com/recipes/715397-312x231.jpg',
    categories: ['main course', 'dinner'],
  },
]

export const cloneDemoRecipes = () => structuredClone(demoRecipes)
