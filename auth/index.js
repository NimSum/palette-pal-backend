const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./tokenVerification');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// Route paths are prepended with /auth
router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  })
})

function validateInputs(user) {
  const validEmail = typeof user.email === 'string' &&
  user.email.trim() !== '';

  // const validUserName = typeof user.username === 'string' &&
  // user.email.trim() !== '';

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

router.post('/signup', (req, res) => {
  const { email, password, username } = req.body;

  if (validateInputs(req.body)) {
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
                jwt.sign({ user }, 'secretkey', options, (err, token) => {
                  res.json({
                    token
                  })
                })
              }
            })
        }
      })
  } else {
    res.status(403).json({ error: "Invalid login" })
  }
})

router.post('/projects', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) res.sendStatus(403);
    res.json({
      message: 'Success!',
      authData
    })
  })
})
module.exports = router;