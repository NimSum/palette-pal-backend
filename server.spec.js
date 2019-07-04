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

  describe('GET /api/v1/projects/:id', () => {
    it('should return a specific project with the id in the endpoint', async () => {
      const expectedProject = await db('projects').first();
      const id = expectedProject.id;

      const response = await request(app).get(`/api/v1/projects/${id}`);
      const result = response.body;

      expect(result.name).toEqual(expectedProject.name);
    })

    it('should respond with an error if no project with requested id', async () => {
      const response = await request(app).get('/api/v1/projects/-1');
      const result = response.body;

      const expected = { 
        error: 'Requested id does not correspond to any projects' 
      };
      expect(result).toEqual(expected);
      expect(response.status).toBe(404);
    })
  })

  describe('GET /api/v1/palettes', () => {
    it('should return all palettes in the db palettes table if they exist', async () => {
      const expectedPalettes = await db('palettes').then(palettes => convertDate(palettes));

      const response = await request(app).get('/api/v1/palettes');
      const result = response.body;

      expect(result).toEqual(expectedPalettes);
    })
  })

  describe('GET /api/v1/palettes/:id', () => {
    it('should return a specific palette with the id in the endpoint', async () => {
      const expectedPalette = await db('palettes').first();
      const id = expectedPalette.id;
      
      const response = await request(app).get(`/api/v1/palettes/${id}`);
      const result = response.body;

      expect(result.name).toEqual(expectedPalette.name);
    })

    it('should respond with an error if no palette with requested id', async () => {
      const response = await request(app).get('/api/v1/palettes/-1');
      const result = response.body;

      const expected = { 
        error: 'Requested id does not correspond to any palettes' 
      };
      expect(result).toEqual(expected);
      expect(response.status).toBe(404);
    })
  })

  describe('POST /api/v1/projects/', () => {
    it('should post a new project in projects db', async () => {
      const newProject = { name: "Nimsum's Portfolio" };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(newProject);
      const id = parseInt(response.body)
      
      const project = await db('projects').where({ id }).first();

      expect(project.name).toEqual(newProject.name);
    })

    it('should reject post if required param is invalid or not recieved', async () => {
      const invalidParam = { invalidParam: "54321" };
      const expectedError = {
        error: 'Required parameter "name" is missing'
      };
      const response = await request(app)
        .post('/api/v1/projects')
        .send(invalidParam);
      expect(response.status).toBe(422);
      expect(response.body).toEqual(expectedError);

      const responseNoParam = await request(app)
      .post('/api/v1/projects')
      expect(responseNoParam.status).toBe(422);
      expect(responseNoParam.body).toEqual(expectedError);
    })

    it('should reject post if project name already exists', async () => {
      const firstProject = await db('projects').first();
      const { name } = firstProject;
      const response = await request(app)
        .post('/api/v1/projects')
        .send({ name });

      const expectedError = { error: 'Project name already exists' };
      expect(response.status).toBe(409);
      expect(response.body).toEqual(expectedError);
    })

  })

  describe('POST /api/v1/palettes/', () => {
    const newPalette = { 
      name: "Nimsum's Warm Palette",
      color_1: "#000000",
      color_2: "#000000",
      color_3: "#000000",
      color_4: "#000000",
      color_5: "#000000",
      project_id: 1
    };
    
    it('should post a new palette in palettes db', async () => {
      
      const response = await request(app)
        .post('/api/v1/palettes')
        .send(newPalette);
      const id = parseInt(response.body)
      
      const palette = await db('palettes').where({ id }).first();

      expect(palette.name).toEqual(newPalette.name);
    })
    
    it('should reject post if required param is invalid or not recieved', async () => {
      newPalette.project_id = null;

      const response = await request(app)
        .post('/api/v1/palettes')
        .send(newPalette);

      const expected = { error: 'Expected parameters of: name, project_id, color_1, color_2, color_3, color_4, color_5. Missing: project_id'};

      expect(response.status).toBe(422);
      expect(response.body).toEqual(expected);
    })

    it('should reject post if project reference id does not match any projects in db', async () => {
      newPalette.project_id = -1;

      const response = await request(app)
        .post('/api/v1/palettes')
        .send(newPalette);
      const error = response.body.error.detail;
      const expected = 'Key (project_id)=(-1) is not present in table \"projects\".';

      expect(response.status).toBe(500);
      expect(error).toEqual(expected);
    })
  })

  describe('DELETE /api/v1/projects/:id', () => {
    it.skip('should delete projects using the id param', async () => {
      const project = await db('projects').first();
      const projectToDelete = project.id;

      const response = await request(app)
        .delete(`/api/v1/projects/${projectToDelete}`);
      const deleted = await db('projects').where( { id: projectToDelete });
      expect(deleted).toEqual(response.body);
    })

    it('should respond with an error if id param is not in the projects db', async () => {

      const response = await request(app)
        .delete('/api/v1/projects/-1');
      const expectedError = { 
        error: 'Failed to Delete: Project does not exist' 
      };
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expectedError);
    })
  })

  describe('DELETE /api/v1/palettes/:id', () => {
    it.skip('should delete palettes using the id param', async () => {
      const palette = await db('palettes').first();
      const paletteToDelete = palette.id;

      const response = await request(app)
        .delete(`/api/v1/palettes/${paletteToDelete}`);
      const deleted = await db('palettes').where( { id: paletteToDelete });
      expect(deleted).toEqual(response.body);
    })

    it('should respond with an error if id param is not in the palettes db', async () => {
      const response = await request(app)
        .delete('/api/v1/palettes/-1');

      const expectedError = { 
        error: 'Failed to Delete: Palette does not exist' 
      };

      expect(response.status).toBe(404);
      expect(response.body).toEqual(expectedError);
    })
  })
})