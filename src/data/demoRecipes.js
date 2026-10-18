// Real Spoonacular results (same ones used in backend/db/seed.sql, down to
// the ingredients from GET /recipes/{id}/information) so the demo
// experience matches what the live API/DB would actually contain.

export const demoRecipes = [
  {
    id: 9001,
    spoonacular_id: 1021260,
    name: 'Simple Protein Pancakes',
    calorie: 147,
    image_url: 'https://img.spoonacular.com/recipes/1021260-312x231.jpg',
    categories: [{ name: 'morning meal' }, { name: 'breakfast' }],
    ingredients: [
      { name: 'almond milk', detail: '2 tbsp almond milk' },
      { name: 'baking powder', detail: '1 tsp baking powder' },
      { name: 'banana', detail: '1 banana' },
      { name: 'eggs', detail: '2 eggs' },
      { name: 'greek yogurt', detail: '1/2 cup Greek yogurt' },
      { name: 'oats', detail: '1 cup quick oats' },
      { name: 'premier protein', detail: '1/3 cup Premier Protein' },
      { name: 'vanilla extract', detail: '1 tsp vanilla extract' },
    ],
  },
  {
    id: 9002,
    spoonacular_id: 1847920,
    name: 'Healthy Quinoa Salad',
    calorie: 226,
    image_url: 'https://img.spoonacular.com/recipes/1847920-312x231.jpg',
    categories: [{ name: 'salad' }, { name: 'snack' }],
    ingredients: [
      { name: 'quinoa', detail: '1 cup red quinoa' },
      { name: 'vegetable broth', detail: '2 cups vegetable broth' },
      { name: 'orange bell pepper', detail: '1 orange bell pepper, diced small' },
      { name: 'green onions', detail: '4 green onions, diced small' },
      { name: 'cucumber', detail: '1 cup english cucumber, peeled and diced' },
      { name: 'tomatoes', detail: '1 cup tomatoes, diced' },
      { name: 'edamame', detail: '1 cup edamame' },
      { name: 'juice of lime', detail: '1 small lime, juiced' },
    ],
  },
  {
    id: 9003,
    spoonacular_id: 638764,
    name: 'Chipotle Turkey Chili',
    calorie: 549,
    image_url: 'https://img.spoonacular.com/recipes/638764-312x231.jpg',
    categories: [{ name: 'lunch' }, { name: 'dinner' }],
    ingredients: [
      { name: 'poblano pepper', detail: '1 large poblano pepper' },
      { name: 'jalapeno pepper', detail: '1 jalapeno pepper' },
      { name: 'onion', detail: '1 large yellow onion, chopped' },
      { name: 'garlic', detail: '3 cloves garlic, minced' },
      { name: 'ground turkey', detail: '1 1/2 pounds ground lean turkey' },
      { name: 'chili powder', detail: '3 tablespoons chili powder' },
      { name: 'chicken stock', detail: '1/2 cup chicken stock' },
      { name: 'kidney beans', detail: '14 1/2 oz can kidney beans, drained and rinsed' },
      { name: 'canned tomatoes', detail: '28 oz. can crushed tomatoes' },
    ],
  },
]

// What a coach would see searching Spoonacular from the admin - not yet
// saved to `demoRecipes` above, so "Enregistrer" has something to do.
// Ingredients are included here (unlike the real search endpoint, which
// only returns them once a recipe is actually saved) purely so the demo
// preview can show what the saved card would look like.
export const demoSpoonacularResults = [
  {
    spoonacular_id: 644045,
    name: 'Fruity Yogurt Parfait',
    calorie: 95,
    image_url: 'https://img.spoonacular.com/recipes/644045-312x231.jpg',
    categories: ['morning meal', 'breakfast'],
    ingredients: [
      { name: 'yogurt', detail: '1 cup Plain yogurt' },
      { name: 'orange juice', detail: '2 teaspoons Lemon or orange juice' },
      { name: 'kiwi', detail: '1 Kiwi, chopped into nice cubes' },
      { name: 'mango', detail: '1/2 Mango, chopped into nice cubes' },
      { name: 'strawberries', detail: '4 Strawberries, chopped into nice cubes' },
    ],
  },
  {
    spoonacular_id: 640828,
    name: 'Crispy Panko and Herb Crusted Salmon',
    calorie: 390,
    image_url: 'https://img.spoonacular.com/recipes/640828-312x231.jpg',
    categories: ['lunch', 'dinner'],
    ingredients: [
      { name: 'salmon fillet', detail: '2 pound salmon fillet' },
      { name: 'panko crumbs', detail: '1 1/2 cup panko crumbs' },
      { name: 'parsley', detail: '1/2 cup Italian parsley finely chopped' },
      { name: 'garlic clove', detail: '1 garlic clove finely chopped' },
      { name: 'lemon zest', detail: 'zest of 1 lemon' },
    ],
  },
  {
    spoonacular_id: 715397,
    name: 'Cheesy Chicken and Rice Casserole',
    calorie: 464,
    image_url: 'https://img.spoonacular.com/recipes/715397-312x231.jpg',
    categories: ['main course', 'dinner'],
    ingredients: [
      { name: 'chicken breast', detail: '2 chicken breasts, cooked and shredded' },
      { name: 'rice', detail: '2 cups cooked rice' },
      { name: 'cheddar cheese', detail: '1 cup shredded cheddar cheese' },
      { name: 'cream of chicken soup', detail: '1 can cream of chicken soup' },
    ],
  },
]

export const cloneDemoRecipes = () => structuredClone(demoRecipes)
