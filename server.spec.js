import request from 'supertest';
import app from './server';
const environment = process.env.NODE_ENV || 'test';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {

  const convertDate = (data) => {
    return data.map(pro => {
      pro.updated_at = pro.updated_at.toJSON();
      pro.created_at = pro.created_at.toJSON();
      return pro
    })
  }

  beforeEach(async () => {
    await database.seed.run();
  })

  describe('GET /api/v1/projects', () => {
    it('should return all projects in the db project table', async () => {
      const expectedProjects = await database('projects').select().then(proj => convertDate(proj));
      const response = await request(app).get('/api/v1/projects');
      const result = response.body
      expect(result).toEqual(expectedProjects);
    })
  })

})