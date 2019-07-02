const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const bodyParser = require('body-parser');
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);
const cors = require('cors');

app.use(bodyParser.json());

app.use(cors());
app.set('port', process.env.PORT || 5555);

app.listen(app.get('port'), () => {
  console.log(`App is running in port ${app.get('port')}`)
});

app.get('/api/v1/projects', (req, res) => {
  database('projects')
  .select()
    .then(projects => {
      projects.length ? res.status(200).json(projects)
        : res.status(404).json({error: 'No projects exist in projects table.'})
    })
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
    .then(palettes => {
      palettes.length ? res.status(200).json(palettes)
        : res.status(404).json({ error: 'No palettes exist in palettes table.' })
    })
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

app.post('/api/v1/palettes', (req, res) => {
  let newPalette = req.body;
  const parameters = [
    'name', 
    'project_id',
    'color_1', 
    'color_2', 
    'color_3', 
    'color_4', 
    'color_5', 
  ];

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

})

app.delete('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;

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
})

app.delete('/api/v1/palettes/:id', (req, res) => {
  const { id } = req.params;

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
})

app.put('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  database('projects')
  .where({ id })
  .update({ name }, ['id'])
  .then((id) => {
    if (!id.length) {
      res.status(404).json({ 
        error: 'Failed to update: Project does not exist' 
      });
    } else res.sendStatus(202);
  })
  .catch(error => res.status(500).json({ error }))  
})

app.put('/api/v1/palettes/:id', (req, res) => {
  const { id } = req.params;
  const updatedPalette = req.body;

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
})

module.exports = app;