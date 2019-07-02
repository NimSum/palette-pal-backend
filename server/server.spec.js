// import request from 'supertest';
// import app from './server';
// const environment = process.env.NODE_ENV || 'test';
// const configuration = require('../knexfile')[environment];
// const database = require('knex')(configuration);

describe('Server', () => {
  // beforeEach(async () => {
  //   await database.seed.run();
  // })

  describe('GET /api/v1/projects', () => {
    it('should return all projects in the db project table', async () => {
      // const expectedProjects = await database('projects').select();
      // const res = await request(app).get('/api/v1/projects');
      // const projects = res.body;
      // expect(projects).toEqual(expectedProjects);
    })
  })

})