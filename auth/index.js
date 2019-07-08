const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');

router.post('/signup', (req, res) => {
  const { email, password, user_name } = req.body;
  const validUserName = typeof user_name === 'string' &&
  user_name.trim() !== '';

  if (validateInputs(req.body) && validUserName) {
    getUser(email)
      .then(user => {
        if (!user) {
          bcrypt.hash(password, 10)
            .then(hash => {
              db('users')
                .insert({ email, password: hash, user_name }, 'id')
                .then(user_id => {
                  addDefaultProject(user_id)
                  res.status(201).json(...user_id)
                })
            })
        } else {
          res.status(400).json({ error: "Email in use" })
        }
      });
  } else {
    res.status(403).json({ error: "Invalid user" })
  }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (validateInputs(req.body)) {
    getUser(email)
      .then(user => {
        if (!user) {
          res.status(403).json({ error: "Invalid login" })
        } else {
          bcrypt.compare(password, user.password)
            .then(result => {
              if (result) {
                let options = {
                  expiresIn: '7d'
                }
                jwt.sign({ user }, 'SECRETKEYGOESHERE', options, async (err, token) => {
                  if (err) res.sendStatus(500);
                  res.json({
                    token,
                    user_id: user.id,
                    projects: await getUserData(user.id)
                  })
                })
              } else res.status(403).json({ error: "Invalid login"})
            })
        }
      })
  } else {
    res.status(403).json({ error: "Invalid login" })
  }
})

function getUserData(userId) {
  return database.raw(`SELECT usr.id AS user_id, proj.project_name, proj.id AS project_id, pal.palette_name, pal.id AS palette_id, pal.color_1, pal.color_2, pal.color_3, pal.color_4, pal.color_5 FROM palettes AS pal RIGHT JOIN projects AS proj ON pal.project_id = proj.id LEFT JOIN users AS usr ON usr.id = proj.user_id ORDER BY proj.updated_at `)
  .then(projects => {
    return projects.rows.filter(proj => proj.user_id === parseInt(userId));
  })
}

async function addDefaultProject(userId) {
  await database('projects')
    .insert({ project_name: "Uncategorized", user_id: parseInt(userId) })
}

function verifyToken(req, res, next) {
  // get auth header value
  // TOKENT FORMAT:
  // Authorization: Bearer <token> ?? maybe not??
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const token = bearerHeader.split(' ')[1];
    req.token = token;
    // replace secret key with env var
    jwt.verify(req.token, 'SECRETKEYGOESHERE', (err, authData) => {
      if (err) {
        res.sendStatus(403)
      } else {
        res.auth = authData;
        next();
      }
    })
  } else {
    res.sendStatus(403);
  }
}

function validateInputs(user) {
  const validEmail = typeof user.email === 'string' &&
  user.email.trim() !== '';

  const validPassword = typeof user.password === 'string' &&
  user.password.trim() !== '' &&
  user.password.length >= 6;

  return validEmail && validPassword;
}

function getUser(email) {
  return database('users')
  .where({ email })
  .first();
}

module.exports = { router, verifyToken };