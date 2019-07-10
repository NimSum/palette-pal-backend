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

    it('should reject new user request if missing params', async () => {
      mockSignupData.user_name = "";

      const response = await request(app)
        .post('/auth/signup')
        .send(mockSignupData);

      const expectedErr = { error: 'Invalid params, user_name, email, password required' }
      expect(response.status).toBe(403)

      expect(response.body).toEqual(expectedErr);
    })

    it('should reject new user request if email is already in use', async () => {
      mockSignupData.user_name = "lynnard";
      mockSignupData.email = "lynnard@lynne.com";

      const response = await request(app)
        .post('/auth/signup')
        .send(mockSignupData);

      const expectedErr = { error: 'Email in use' }
      expect(response.status).toBe(400)

      expect(response.body).toEqual(expectedErr);
    })

  })

  describe('POST /auth/login', () => {
    const mockValidUser = {
      "email": "nimsum@nim.com",
      "password": "nimsum"
    }
    const expectedError = {"error": "Invalid login"};

    it('should login new user with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(mockValidUser)

      expect(response.status).toEqual(200);
      expect(typeof response.body.token).toEqual('string');
      expect(response.body.projects).toHaveLength(1);
    })

    it('should reject if user email is invalid', async () => {
      mockValidUser.email = "invalid@email.com";

      const invalidEmail = await request(app)
        .post('/auth/login')
        .send(mockValidUser)
      expect(invalidEmail.status).toBe(403);
      expect(invalidEmail.body).toEqual(expectedError)
    })

    it('should reject if user password is invalid', async () => {
      mockValidUser.email = "nimsum@nim.com";
      mockValidUser.password = "password";

      const invalidPassword = await request(app)
        .post('/auth/login')
        .send(mockValidUser)
      expect(invalidPassword.status).toBe(403);
      expect(invalidPassword.body).toEqual(expectedError)
    })

    it('should reject if email or password does not meet required criterias', async () => {
      mockValidUser.email = "";

      const invalidInputs = await request(app)
        .post('/auth/login')
        .send(mockValidUser)

      expect(invalidInputs.status).toBe(403)
      expect(invalidInputs.body).toEqual(expectedError)
    })


  })
})