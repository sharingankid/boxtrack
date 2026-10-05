const { mapResult } = require('../src/services/spoonacularService');

describe('spoonacularService.mapResult', () => {
  it('maps a full Spoonacular result to the importable recipe shape', () => {
    const result = {
      id: 634476,
      title: 'Bbq Chicken',
      image: 'https://img.spoonacular.com/recipes/634476-312x231.jpg',
      dishTypes: ['lunch', 'main course'],
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: 478.4, unit: 'kcal' },
          { name: 'Fat', amount: 21.7, unit: 'g' },
        ],
      },
    };

    expect(mapResult(result)).toEqual({
      spoonacular_id: 634476,
      name: 'Bbq Chicken',
      calorie: 478,
      image_url: 'https://img.spoonacular.com/recipes/634476-312x231.jpg',
      categories: ['lunch', 'main course'],
    });
  });

  it('defaults gracefully when nutrition, image, or dishTypes are missing', () => {
    const result = { id: 1, title: 'Mystery Dish' };

    expect(mapResult(result)).toEqual({
      spoonacular_id: 1,
      name: 'Mystery Dish',
      calorie: 0,
      image_url: null,
      categories: [],
    });
  });
});
