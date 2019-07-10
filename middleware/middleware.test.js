const checkUserPalettes = require('./checkUserPalettes');
const checkUserProjects = require('./checkUserProjects');
const verifyToken = require('./verifyToken');
const app = require('../server');
const request = require('supertest');
const mockData = require('../db/seeds/seeds-data/dummyData.json');
const db = require('../db')

describe('Middlewares', () => {

  beforeEach(async () => {
		await db.seed.run();
  });

  describe('checkUserPalettes', () => {
    it('should intercept user before deletion if palette id does not belong to user id', async () => {
      const response = await request(app)
        .delete('/api/v1/palettes/1')
        .set({ authorization: mockData.lynnardsToken })
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Not a user palette or invalid id"});
    })

    it('should continue if palette is owned by user', async () => {
      const response = await request(app)
        .delete('/api/v1/palettes/2')
        .set({ authorization: mockData.lynnardsToken })
      expect(response.status).toBe(202);
    })
  })

  describe('cherUserProjects', () => {
    it('should intercept user before deletion if project id does not belong to user id', async () => {
      const response = await request(app)
        .delete('/api/v1/projects/1')
        .set({ authorization: mockData.nimsumsToken })

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Not a user project or invalid id"});
    })

    it('should continue if project is owned by user', async () => {
      const response = await request(app)
        .delete('/api/v1/projects/2')
        .set({ authorization: mockData.nimsumsToken })

      expect(response.status).toBe(202);
    })
  })

 
})