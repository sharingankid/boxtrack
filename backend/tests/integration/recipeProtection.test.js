const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

describe('Recipe routes - protected access', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
  });

  afterAll(async () => {
    await closePool();
  });

  it('rejects admin search with no token', async () => {
    const res = await request(app).get('/api/admin/recipes/search').query({ query: 'salad' });
    expect(res.status).toBe(401);
  });

  it('rejects POST/PUT/DELETE without a token', async () => {
    const postRes = await request(app).post('/api/admin/recipes').send({ name: 'Test', calorie: 100 });
    expect(postRes.status).toBe(401);

    const putRes = await request(app).put('/api/admin/recipes/1').send({ calorie: 200 });
    expect(putRes.status).toBe(401);

    const deleteRes = await request(app).delete('/api/admin/recipes/1');
    expect(deleteRes.status).toBe(401);
  });

  it('allows a coach with a valid token to create a recipe', async () => {
    const token = await loginToken();
    const res = await request(app)
      .post('/api/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Avocado Toast', calorie: 320 });
    expect(res.status).toBe(201);
  });

  it('leaves public read routes accessible without any token', async () => {
    const list = await request(app).get('/api/recipes');
    expect(list.status).toBe(200);
  });
});
