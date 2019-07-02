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


