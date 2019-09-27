const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');
const auth = require('./auth');
const verifyToken = require('./middleware/verifyToken');
const checkIfUserPalette = require('./middleware/checkUserPalettes');
const checkIfUserProject = require('./middleware/checkUserProjects');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
  
app.use(bodyParser.json());
app.use('/auth', auth.router);
app.use(cors());
app.set('port', process.env.PORT || 3005);

app.listen(app.get('port'), () => {
	console.log(`App is running in port ${app.get('port')}`);
});

app.get('/api/v1/projects', verifyToken, (req, res) => {
  const { palettes } = req.query;
	if (palettes === 'included') {
		db
			.raw(
				`SELECT usr.id AS user_id, proj.project_name, proj.id AS project_id, pal.palette_name, pal.id AS palette_id, pal.color_1, pal.color_2, pal.color_3, pal.color_4, pal.color_5 FROM palettes AS pal RIGHT JOIN projects AS proj ON pal.project_id = proj.id LEFT JOIN users AS usr ON usr.id = proj.user_id WHERE usr.id IN (${res
					.auth.user.id}) ORDER BY proj.updated_at`
			)
			.then(projects => {
				res.status(200).json(projects.rows);
			})
			.catch(error => res.status(500).json({ error }));
	} else {
		db('projects')
			.select()
			.then(projects => {
        const filtered = projects.filter(proj => proj.user_id === res.auth.user.id)
        res.status(200).json(filtered)
      })
			.catch(error => res.status(500).json({ error }));
	}
});

app.get('/api/v1/projects/:id', verifyToken, (req, res) => {
	db('projects')
		.where({ id: req.params.id })
		.then(project => {
			if (!project.length) {
				res.status(404).json({
					error: 'Requested id does not correspond to any projects'
				});
			} else if (project[0].user_id !== res.auth.user.id) {
				res.status(403).json({
					error: 'Requested id does not correspond to any projects for this user'
				});
			} else {
				res.status(200).json(...project);
			}
		})
		.catch(error => res.status(500).json({ error }));
});

app.get('/api/v1/palettes', (req, res) => {
	const { project_id } = req.query;

	if (project_id) {
		db('palettes')
			.where({ project_id })
			.then(palettes => res.status(200).json(palettes))
			.catch(error => res.status(500).json({ error }));
	} else {
		db('palettes')
			.select()
			.then(palettes => res.status(200).json(palettes))
			.catch(error => res.status(500).json({ error }));
	}
});

app.get('/api/v1/palettes/:id', (req, res) => {
	db('palettes')
		.where({ id: req.params.id })
		.then(palette => {
			if (!palette.length) {
				res.status(404).json({
					error: 'Requested id does not correspond to any palettes'
				});
			} else {
				res.status(200).json(...palette);
			}
		})
		.catch(error => res.status(500).json({ error }));
});

app.post('/api/v1/projects', verifyToken, (req, res) => {
	let { project_name } = req.body;

		if (!project_name)
			return res.status(422).send({
				error: 'Required parameter "project_name" is missing'
			});
		db('projects')
			.insert({ project_name, user_id: res.auth.user.id }, 'id')
			.then(projectId => res.status(201).json(...projectId))
			.catch(error => res.status(500).json({ error }));
});

app.post('/api/v1/palettes', verifyToken, (req, res) => {
	let newPalette = req.body;

	const parameters = [ 'palette_name', 'project_id', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5' ];

		for (let requiredParam of parameters) {
			if (!newPalette[requiredParam]) {
				res.status(422).json({
					error: `Expected parameters of: ${parameters.join(', ')}. Missing: ${requiredParam}`
				});
				return;
			}
		}

		db('palettes')
			.insert(newPalette, 'id')
			.then(paletteId => res.status(201).json(...paletteId))
			.catch(error => res.status(500).json({ error }));
});

app.delete('/api/v1/projects/:id', verifyToken, checkIfUserProject, (req, res) => {
	const { id } = req.params;

	db('projects')
		.where({ id })
		.del()
		.then(delCount => {
			if (!delCount) {
				res.status(404).json({
					error: 'Failed to Delete: Project does not exist'
				});
      } else res.sendStatus(202).json('Project successfully deleted');
		})
		.catch(error => res.status(500).json({ error }));
});

app.delete('/api/v1/palettes/:id', verifyToken, checkIfUserPalette, (req, res) => {
	const { id } = req.params;

	db('palettes')
		.where({ id })
		.del()
		.then(delCount => {
			if (!delCount) {
				res.status(404).json({
					error: 'Failed to Delete: Palette does not exist'
				});
      } else res.sendStatus(202).json('Palette successfully updated');
		})
		.catch(error => res.status(500).json({ error }));
});

app.put('/api/v1/projects/:id', verifyToken, checkIfUserProject, (req, res) => {
	const { id } = req.params;
	const { project_name } = req.body;

	db('projects')
		.where({ id })
		.update({ project_name }, [ 'id' ])
		.then(id => {
			if (!id.length) {
				res.status(404).json({
					error: 'Failed to update: Project does not exist'
				});
			} else res.sendStatus(202).json('Project successfully updated');
		})
		.catch(error => res.status(500).json({ error }));
});

app.put('/api/v1/palettes/:id', verifyToken, checkIfUserPalette, (req, res) => {
	const { id } = req.params;
	const updatedPalette = req.body;

	db('palettes').where({ id }).update({ ...updatedPalette }, [ 'id' ]).then(id => {
		if (!id.length) {
			res.status(404).json({
				error: 'Failed to update: Palette does not exist'
			});
    } else res.sendStatus(202).json('Palette successfully updated');
	});
});

app.patch('/api/v1/palettes/:id', verifyToken, async (req, res) => {
	const { id } = req.params;
  const palette = await db('palettes').where({ id }).select('user_save_count').first();
  if (palette) {
    db('palettes').where({ id }).update({ 
      user_save_count: palette.user_save_count + 1,
      updated_at: db.fn.now() ,
      }, [ 'id' ])
      .then(id => res.sendStatus(202));
  } else {
    res.status(404).json({
      error: 'Failed to update: Palette does not exist'
    });
  };
});

module.exports = app;
