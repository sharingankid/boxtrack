const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

describe('Recipe routes - validation', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    token = await loginToken();
  });

  afterAll(async () => {
    await closePool();
  });

  function post(body) {
    return request(app).post('/api/admin/recipes').set('Authorization', `Bearer ${token}`).send(body);
  }

  it('rejects a missing name', async () => {
    const res = await post({ calorie: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing calorie', async () => {
    const res = await post({ name: 'Avocado Toast' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a negative calorie', async () => {
    const res = await post({ name: 'Avocado Toast', calorie: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts a minimal valid recipe (no categories, no image)', async () => {
    const res = await post({ name: 'Avocado Toast', calorie: 320 });
    expect(res.status).toBe(201);
    expect(res.body.recipe.categories).toEqual([]);
    expect(res.body.recipe.image_url).toBeNull();
  });

  it('rejects an empty name on update', async () => {
    const created = await post({ name: 'Avocado Toast', calorie: 320 });
    const res = await request(app)
      .put(`/api/admin/recipes/${created.body.recipe.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });
});
