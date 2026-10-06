const request = require('supertest');
const app = require('../../../src/app');
const { TEST_COACH_EMAIL, TEST_PASSWORD } = require('./testDb');

async function loginToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_COACH_EMAIL, password: TEST_PASSWORD });
  return res.body.token;
}

module.exports = { loginToken };
