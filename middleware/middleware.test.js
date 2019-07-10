const checkUserPalettes = require('./checkUserPalettes');
const checkUserProjects = require('./checkUserProjects');
const verifyToken = require('./verifyToken');
const app = require('../server');
const request = require('supertest');
const mockData = require('../db/seeds/seeds-data/dummyData.json');

describe('Middlewares', () => {
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

 
})