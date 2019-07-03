import request from 'supertest';
import app from './server';
const environment = process.env.NODE_ENV || 'test';
const configuration = require('./knexfile')[environment];
const db = require('knex')(configuration);

describe('Server', () => {

  const convertDate = (data) => {
    return data.map(pro => {
      pro.updated_at = pro.updated_at.toJSON();
      pro.created_at = pro.created_at.toJSON();
      return pro
    })
  }

  beforeEach(async () => {
    await db.seed.run();
  })

  describe('GET /api/v1/projects', () => {
    it('should return all projects in the db project table if they exist', async () => {
      const expectedProjects = await db('projects').select().then(proj => convertDate(proj));
      const response = await request(app).get('/api/v1/projects');
      const result = response.body
      expect(result).toEqual(expectedProjects);
    })
  })

  // describe('GET /api/v1/projects', () => {
  //   it.skip('should return a message if there are no records in the projects table', async () => {
  //     const expectedPalettes = await db('palettes').select().del();
  //     const expectedProjects = await db('projects').select().del()
  //     // .select().then(proj => convertDate(proj));
  //     const response = await request(app).get('/api/v1/projects');
  //     const result = response.body;
  //     expect(result).toEqual({error: 'No projects exist in projects table.'});
  //   })
  // })

  describe('GET /api/v1/projects/:id', () => {
    it('should return a specific project with the id in the endpoint', async () => {
      const expectedProject = await db('projects').first();
      const id = expectedProject.id;

      const response = await request(app).get(`/api/v1/projects/${id}`);
      const result = response.body;
      console.log(result)

      expect(result.name).toEqual(expectedProject.name);
    })
  })

  

})