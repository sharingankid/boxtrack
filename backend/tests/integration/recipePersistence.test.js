const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

const FULL_RECIPE = {
  spoonacular_id: 634476,
  name: 'Bbq Chicken',
  calorie: 478,
  image_url: 'https://img.spoonacular.com/recipes/634476-312x231.jpg',
  categories: ['lunch', 'main course'],
};

describe('Recipe persistence', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    token = await loginToken();
  });

  afterAll(async () => {
    await closePool();
  });

  it('persists a recipe with categories and reassembles it identically on read', async () => {
    const createRes = await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_RECIPE);
    expect(createRes.status).toBe(201);
    const id = createRes.body.recipe.id;

    const getRes = await request(app).get(`/api/recipes/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.recipe.name).toBe(FULL_RECIPE.name);
    expect(getRes.body.recipe.calorie).toBe(FULL_RECIPE.calorie);
    expect(getRes.body.recipe.categories).toEqual([{ name: 'lunch' }, { name: 'main course' }]);
  });

  it('PUT replaces categories entirely, leaves name/calorie untouched if omitted', async () => {
    const createRes = await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_RECIPE);
    const id = createRes.body.recipe.id;

    const putRes = await request(app)
      .put(`/api/admin/recipes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['dinner'] });

    expect(putRes.status).toBe(200);
    expect(putRes.body.recipe.categories).toEqual([{ name: 'dinner' }]);
    expect(putRes.body.recipe.name).toBe(FULL_RECIPE.name);
    expect(putRes.body.recipe.calorie).toBe(FULL_RECIPE.calorie);
  });

  it('DELETE removes the recipe - a later GET 404s', async () => {
    const createRes = await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_RECIPE);
    const id = createRes.body.recipe.id;

    const deleteRes = await request(app)
      .delete(`/api/admin/recipes/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/recipes/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('GET /recipes lists every saved recipe, newest first', async () => {
    await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'First', calorie: 100 });
    await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second', calorie: 200 });

    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
    expect(res.body.recipes.map((r) => r.name)).toEqual(['Second', 'First']);
  });
});
