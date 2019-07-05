const express = require('express');
const router = express.Router();

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

router.post('/signup', (req, res) => {
  const { email } = req.body;

  if (validateUser(req.body)) {
    database('users')
      .where({ email })
      .first()
      .then(user => {
        if (!user) {
          res.json({
            user,
            message: '✅'
          })
        } else {
          res.status(400).json({ error: "Email in use" })
        }
      });
  } else {
    res.status(403).json({ error: "Invalid user" })
  }
})

module.exports = router;