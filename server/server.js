const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), () => {
  console.log(`App is running in port ${app.get('port')}`)
});

app.get('/api/v1/projects', (req, res) => {
  database('projects')
  .select()
  .then(projects => res.status(200).json(projects))
  .catch(error => res.status(500).json({ error }))
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

app.post('/api/v1/projects', (req, res) => {
  let { name } = req.body;
  if (!name) {
    return res.status(422).send({
      error: 'Required parameter "name" is missing'
    });
  }

  database('projects')
  .where({ name })
  .then(project => {
    if (!!project.length) {
      res.status(409).json({ error: 'Project name already exists' })
    } else {
      database('projects').insert({ name }, 'id')
      .then(projectId => res.status(201).json(projectId))
      .catch(error => res.status(500).json({ error }))
    }
  }).catch(error => res.status(500).json({ error }))
});
