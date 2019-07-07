const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const bodyParser = require('body-parser');
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const cors = require('cors');
const auth = require('./auth');

app.use(bodyParser.json());
app.use('/auth', auth.router);
app.use(cors());
app.set('port', process.env.PORT || 3001);
// app.use(cookieParser(process.env.COOKIE_SECRET));

app.listen(app.get('port'), () => {
  console.log(`App is running in port ${app.get('port')}`)
});

app.get('/api/v1/projects', (req, res) => {
  const { palettes } = req.query;

  if (palettes === 'included') {
    database('palettes')
    .join('projects', 'projects.id', '=', 'palettes.project_id')
    .then(projects => res.status(200).json(projects))
    .catch(error => res.status(500).json({ error }))
  } else {
    database('projects')
    .select()
    .then(projects => res.status(200).json(projects))
    .catch(error => res.status(500).json({ error }))
  }
});

app.get('/api/v1/projects/:id', (req, res) => {
  database('projects')
    .where({ id: req.params.id })
    .then(project => {
      if (!project.length) {
        res.status(404).json({ 
          error: 'Requested id does not correspond to any projects' 
        })
      }
      else {
        res.status(200).json(...project)
      };
    })
    .catch(error => res.status(500).json({ error }));
})

app.get('/api/v1/palettes', (req, res) => {
  database('palettes')
  .select()
    .then(palettes => res.status(200).json(palettes))
  .catch(error => res.status(500).json({ error }))
});

app.get('/api/v1/palettes/:id', (req, res) => {
  database('palettes')
    .where({ id: req.params.id })
    .then(palette => {
      if (!palette.length) {
        res.status(404).json({ 
          error: 'Requested id does not correspond to any palettes' 
        })
      }
      else {
        res.status(200).json(...palette)
      };
    })
    .catch(error => res.status(500).json({ error }));
})

app.post('/api/v1/projects', auth.verifyToken, (req, res) => {
  let { project_name } = req.body;
  let user_id = parseInt(req.query.user_id);
  if (!project_name)
    return res.status(422).send({
      error: 'Required parameter project_name is missing'
  });

  if (res.auth.user.id === user_id) {
    database('projects').insert({ project_name, user_id }, 'id')
    .then(projectId => res.status(201).json(projectId))
    .catch(error => res.status(500).json({ error }))
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/v1/palettes', auth.verifyToken, (req, res) => {
  let newPalette = req.body;
  let user_id = parseInt(req.query.user_id);

  const parameters = [
    'palette_name', 
    'project_id',
    'color_1', 
    'color_2', 
    'color_3', 
    'color_4', 
    'color_5', 
  ];

  if (res.auth.user.id === user_id) {
    for (let requiredParam of parameters) {
      if (!newPalette[requiredParam] ) {
        res.status(422).json({ error: 
          `Expected parameters of: ${parameters.join(', ')}. Missing: ${ requiredParam }`})
        return;
      }
    }

    database('palettes').insert(newPalette, 'id')
    .then(paletteId => res.status(201).json(paletteId))
    .catch(error => res.status(500).json({ error }))
  } else {
    res.sendStatus(403);
  }
})

app.delete('/api/v1/projects/:id', auth.verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = parseInt(req.query.user_id);

  if (res.auth.user.id === user_id) {
    database('projects')
    .where({ id })
    .del()
    .then((delCount) => {
      if (!delCount) {
        res.status(404).json({ 
          error: 'Failed to Delete: Project does not exist' 
        }) 
      } else res.sendStatus(202);
    })
    .catch(error => res.status(500).json({ error }))
  } else {
    res.sendStatus(403);
  }
})

app.delete('/api/v1/palettes/:id', auth.verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = parseInt(req.query.user_id);

  if (res.auth.user.id === user_id) {
    database('palettes')
    .where({ id })
    .del()
    .then((delCount) => {
      if (!delCount) {
        res.status(404).json({ 
          error: 'Failed to Delete: Palette does not exist' 
        }) 
      } else res.sendStatus(202);
    })
    .catch(error => res.status(500).json({ error }))
  } else {
    res.sendStatus(403);
  }
})

app.put('/api/v1/projects/:id', auth.verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = parseInt(req.query.user_id);
  const { project_name } = req.body;

  if (res.auth.user.id === user_id) {
    database('projects')
    .where({ id })
    .update({ project_name }, ['id'])
    .then((id) => {
      if (!id.length) {
        res.status(404).json({ 
          error: 'Failed to update: Project does not exist' 
        });
      } else res.sendStatus(202);
    })
    .catch(error => res.status(500).json({ error }))  
  } else {
    res.sendStatus(403);
  }

})

app.put('/api/v1/palettes/:id', auth.verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = parseInt(req.query.user_id);
  const updatedPalette = req.body;

  if (res.auth.user.id === user_id) {
    database('palettes')
    .where({ id })
    .update({ ...updatedPalette }, ['id'])
    .then((id) => {
      if (!id.length) {
        res.status(404).json({ 
          error: 'Failed to update: Palette does not exist' 
        });
      } else res.sendStatus(202);
    })
    .catch(error => res.status(500).json({ error }))  
  } else {
    res.sendStatus(403);
  }
})


module.exports = app;