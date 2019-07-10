const { router } = require('./index');
const app = require('../server');
const request = require('supertest');
const db = require('../db');

describe('Authorization router', () => {
  const mockSignupData = {
    "user_name": "obi",
    "email": "one@kenobi.com",
    "password": "HelloThere"
  }
  const mockLogin = {
    "user_name": "obi",
    "password": "HelloThere"
  }

  beforeEach(async () => {
		await db.seed.run();
  });
  
  describe('POST /auth/signup', () => {

    it('should create new user with valid params', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(mockSignupData);
      expect(response.status).toBe(201)
      expect(response.body).toEqual(3);
    })
  })
})