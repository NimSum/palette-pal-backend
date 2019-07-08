import request from 'supertest';
import app from './server';
const environment = process.env.NODE_ENV || 'test';
const configuration = require('./knexfile')[environment];
const db = require('knex')(configuration);
const dummyData = require('./db/seeds/seeds-data/dummyData.json')

describe('Server', () => {
	const convertDate = data => {
		return data.map(pro => {
			pro.updated_at = pro.updated_at.toJSON();
			pro.created_at = pro.created_at.toJSON();
			return pro;
		});
	};

	beforeEach(async () => {
		await db.seed.run();
	});

	describe('GET /api/v1/projects', () => {
		it('should return all projects in the db project table if they exist', async () => {
			const expectedProjects = await db('projects').select().then(proj => convertDate(proj));

			const response = await request(app).get('/api/v1/projects');
			const result = response.body;

			expect(result).toEqual(expectedProjects);
    });
    
    it('should return projects with palettes included if query string is set to included', async () => {

      const response = await request(app)
        .get('/api/v1/projects?palettes=included');
      const result = response.body[0];

      expect(result).toHaveProperty('color_1');
			expect(result).toHaveProperty('color_3');
			expect(result).toHaveProperty('color_5');      
    })
	});

	describe('GET /api/v1/projects/:id', () => {
		it('should return a specific project with the id in the endpoint', async () => {
			const expectedProject = await db('projects').first();
			const id = expectedProject.id;

			const response = await request(app).get(`/api/v1/projects/${id}`);
			const result = response.body;

			expect(result.name).toEqual(expectedProject.name);
		});

		it('should respond with an error if no project with requested id', async () => {
			const response = await request(app).get('/api/v1/projects/-1');
			const result = response.body;

			const expected = {
				error: 'Requested id does not correspond to any projects'
			};
			expect(result).toEqual(expected);
			expect(response.status).toBe(404);
		});
	});

	describe('GET /api/v1/palettes', () => {
		it('should return all palettes in the db palettes table if they exist', async () => {
			const expectedPalettes = await db('palettes').then(palettes => convertDate(palettes));

			const response = await request(app).get('/api/v1/palettes');
			const result = response.body;

			expect(result).toEqual(expectedPalettes);
		});
	});

	describe('GET /api/v1/palettes/:id', () => {
		it('should return a specific palette with the id in the endpoint', async () => {
			const expectedPalette = await db('palettes').first();
			const id = expectedPalette.id;

			const response = await request(app).get(`/api/v1/palettes/${id}`);
			const result = response.body;

			expect(result.name).toEqual(expectedPalette.name);
		});

		it('should respond with an error if no palette with requested id', async () => {
			const response = await request(app).get('/api/v1/palettes/-1');
			const result = response.body;

			const expected = {
				error: 'Requested id does not correspond to any palettes'
			};
			expect(result).toEqual(expected);
			expect(response.status).toBe(404);
		});
	});

	describe('POST /api/v1/projects/', () => {
		it('should post a new project in projects db', async () => {
			const newProject = { 
        project_name: "Nimsum's Portfolio"
      };

      const response = await request(app)
        .post('/api/v1/projects?user_id=1')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newProject)
			const id = parseInt(response.body);

			const project = await db('projects').where({ id }).first();
			expect(response.status).toBe(201);
			expect(project.project_name).toEqual(newProject.project_name);
    });
    
		it('should reject post if required param is invalid or not recieved', async () => {
      const invalidBody = { invalidParam: '54321' };
			const expectedError = {
        error: 'Required parameter "project_name" is missing'
			};
      
      const response = await request(app)
      .post('/api/v1/projects?user_id=1')
      .set({ authorization: dummyData.nimsumsToken })
      .send(invalidBody)
      
      const responseNoParam = await request(app)
      .post('/api/v1/projects?user_id=1')
      .set({ authorization: dummyData.nimsumsToken })
      
      expect(response.status).toBe(422);
			expect(responseNoParam.status).toBe(422);
			expect(responseNoParam.body).toEqual(expectedError);
    });
    
    it('should reject if user sends invalid token or bad user_id query', async () => {
      const newProject = { 
        project_name: "Nimsum's Portfolio"
      };
  
      const invalidToken = await request(app)
        .post('/api/v1/projects?user_id=1')
        .set({ authorization: 'Bearer 12456' })
        .send(newProject)
      
      const invalidQueryId = await request(app)
        .post('/api/v1/projects?user_id=2')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newProject)
  
      expect(invalidToken.status).toBe(403);
      expect(invalidQueryId.status).toBe(403);
    });
	});
  
	describe('POST /api/v1/palettes/', () => {
		const newPalette = {
			palette_name: "Nimsum's Warm Palette",
			color_1: '#000000',
			color_2: '#000000',
			color_3: '#000000',
			color_4: '#000000',
			color_5: '#000000',
			project_id: 1
		};

		it('should post a new palette in palettes db', async () => {
      const response = await request(app)
        .post('/api/v1/palettes?user_id=1')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newPalette)
			const id = parseInt(response.body);

			const palette = await db('palettes').where({ id }).first();

			expect(response.status).toBe(201);
			expect(palette.name).toEqual(newPalette.name);
		});

		it('should reject post if required param is invalid or not recieved', async () => {
			newPalette.project_id = null;

			const response = await request(app)
        .post('/api/v1/palettes?user_id=1')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newPalette)

			const expected = {
				error:
					'Expected parameters of: palette_name, project_id, color_1, color_2, color_3, color_4, color_5. Missing: project_id'
			};

			expect(response.status).toBe(422);
			expect(response.body).toEqual(expected);
		});

		it('should reject post if project reference id does not match any projects in db', async () => {
			newPalette.project_id = -1;

			const response = await request(app)
        .post('/api/v1/palettes?user_id=1')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newPalette);

			const error = response.body.error.detail;
			const expected = 'Key (project_id)=(-1) is not present in table "projects".';

			expect(response.status).toBe(500);
			expect(error).toEqual(expected);
    });
    
    it('should reject if user sends invalid token bad user_id query', async () => {
      const invalidToken = await request(app)
        .post('/api/v1/palettes?user_id=1')
        .set({ authorization: 'Bearer 12456' })
        .send(newPalette)
      
      const invalidQueryId = await request(app)
        .post('/api/v1/palettes?user_id=2')
        .set({ authorization: dummyData.nimsumsToken })
        .send(newPalette)
  
      expect(invalidToken.status).toBe(403);
      expect(invalidQueryId.status).toBe(403);
    });
	});

	describe('DELETE /api/v1/projects/:id', () => {
		it('should delete projects using the id param', async () => {
			const project = await db('projects').first();
      const projectToDelete = project.id;
      
      const response = await request(app)
      .delete(`/api/v1/projects/${projectToDelete}?user_id=1`)
      .set({ authorization: dummyData.nimsumsToken })

			const deleted = await db('projects').where({ id: projectToDelete });

			expect(response.status).toBe(202);
			expect(deleted).toEqual([]);
    });
    
    it('should delete all palettes associated with a project when a project is deleted', async () => {
      const project = await db('projects').first();
      const projectID = project.id;

      const response = await request(app)
      .delete(`/api/v1/projects/${projectID}?user_id=1`)
      .set({ authorization: dummyData.nimsumsToken })

      const deleted = await db('palettes').where({ project_id: projectID });

      expect(response.status).toBe(202);
      expect(deleted).toEqual([]);
    });

		it('should respond with an error if id param is not in the projects db', async () => {
      const invalideId = -1;

			const response = await request(app)
      .delete(`/api/v1/projects/${invalideId}?user_id=1`)
      .set({ authorization: dummyData.nimsumsToken });

			const expectedError = {
				error: 'Failed to Delete: Project does not exist'
      };
      
			expect(response.status).toBe(404);
			expect(response.body).toEqual(expectedError);
		});
	});

	describe('DELETE /api/v1/palettes/:id', () => {
		it('should delete palettes using the id param', async () => {
			const palette = await db('palettes').first();
			const paletteToDelete = palette.id;

			const response = await request(app)
      .delete(`/api/v1/palettes/${paletteToDelete}?user_id=1`)
      .set({ authorization: dummyData.nimsumsToken })

			const deleted = await db('palettes').where({ id: paletteToDelete });

			expect(response.status).toBe(202);
			expect(deleted).toEqual([]);
		});

		it('should respond with an error if id param is not in the palettes db', async () => {
      const invalidId = -1;
			const response = await request(app)
      .delete(`/api/v1/palettes/${invalidId}?user_id=1`)
      .set({ authorization: dummyData.nimsumsToken })

			const expectedError = {
				error: 'Failed to Delete: Palette does not exist'
			};

			expect(response.status).toBe(404);
			expect(response.body).toEqual(expectedError);
		});
	});

	describe('PUT /api/v1/projects/:id', () => {
		const newName = { "project_name": "TEST USER 5" };

		it('should update the project name on valid requests', async () => {
			const project = await db('projects').first();
      const projectToUpdate = project.id;
      
      const response = await request(app)
        .put(`/api/v1/projects/${projectToUpdate}?user_id=2`)
        .set({ authorization: dummyData.lynnardsToken })
        .send(newName)

      const updated = await db('projects').where({ id: projectToUpdate }).first();
      
			expect(response.status).toBe(202);
			expect(updated.name).toEqual(newName.name);
		});

		it('should respond with an error for invalid project id', async () => {
			const error = {
				error: 'Failed to update: Project does not exist'
			};
      const invalidId = -1;
      
      const response = await request(app)
        .put(`/api/v1/projects/${invalidId}?user_id=2`)
        .set({ authorization: dummyData.lynnardsToken })
        .send(newName)

			expect(response.status).toBe(404);
			expect(response.body).toEqual(error);
		});
	});

	describe('PUT /api/v1/palettes/:id', () => {
		const updatedPalette = {
			color_1: '#000000',
			color_4: '#001100',
			palette_name: 'NEW UPDATED'
		};

		it('should update the palette props on valid requests', async () => {
			const palette = await db('palettes').first();
			const paletteToUpdate = palette.id;

			const response = await request(app)
        .put(`/api/v1/palettes/${paletteToUpdate}?user_id=1`)
        .set({ authorization: dummyData.nimsumsToken })
        .send(updatedPalette)

			const updated = await db('palettes').where({ id: paletteToUpdate }).first();

			expect(response.status).toBe(202);
			expect(updated.color_1).toEqual(updatedPalette.color_1);
			expect(updated.color_4).toEqual(updatedPalette.color_4);
			expect(updated.name).toEqual(updatedPalette.name);
		});

		it('should respond with an error for invalid palette id', async () => {
			const error = {
				error: 'Failed to update: Palette does not exist'
      };
      const invalidId = -1;

			const response = await request(app)
        .put(`/api/v1/palettes/${invalidId}?user_id=1`)
        .set({ authorization: dummyData.nimsumsToken })
        .send(updatedPalette)

			expect(response.status).toBe(404);
			expect(response.body).toEqual(error);
		});
	});
});
