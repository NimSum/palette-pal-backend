const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// Route paths are prepended with /auth
router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  })
})

router.post('/signup', (req, res) => {
  const { email, password, username } = req.body;

  const validUserName = typeof username === 'string' &&
  email.trim() !== '';

  if (validateInputs(req.body) && validUserName) {
    getUser(email)
      .then(user => {
        console.log(user)
        if (!user) {
          bcrypt.hash(password, 10)
            .then(hash => {
              database('users')
                .insert({ email, password: hash, username }, 'id')
                .then(userId => res.status(201).json(userId))
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
                // replace secret key with env var
                jwt.sign({ user }, process.env.SECRET_KEY, options, (err, token) => {
                  if (err) res.sendStatus(500);
                  res.json({
                    token,
                    user_id: user.id
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

router.post('/projects', verifyToken, (req, res) => {
  res.json(res.auth);
})

function verifyToken(req, res, next) {
  // get auth header value
  // TOKENT FORMAT:
  // Authorization: Bearer <token> ?? maybe not??
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const token = bearerHeader.split(' ')[1];
    req.token = token;
    // replace secret key with env var
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
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