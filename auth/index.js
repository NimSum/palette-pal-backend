const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// Route paths are prepended with /auth
router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  })
})

function validateUser(user) {
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

router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (validateUser(req.body)) {
    getUser(email)
      .then(user => {
        console.log(user)
        if (!user) {
          bcrypt.hash(password, 10)
            .then(hash => {
              database('users')
                .insert({ email, password: hash }, 'user_id')
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

  if (validateUser(req.body)) {
    getUser(email)
      .then(user => {
        if (!user) {
          res.status(403).json({ error: "Invalid login" })
        } else {
          bcrypt.compare(password, user.password)
            .then(result => {
              const isSecure = req.app.get('env') !== 'development';
              if (result) {
                res.cookie({user_id: user.user_id}, {
                  httpOnly: true,
                  signed: true,
                  secure: isSecure
                })
                res.json({
                  logged_in: result
                })
              }
            })
        }
      })
  } else {
    res.status(403).json({ error: "Invalid login" })
  }
})

module.exports = router;