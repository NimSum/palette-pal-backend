const express = require('express');
const router = express.Router();

// Route paths are prepended with /auth
router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  })
})


// User Requirements
// Can login with valid email/password
// Email is required - error for invalid emails
// Password is required - error for incorrect
function validateUser(user) {
  const validEmail = typeof user.email === 'string' &&
  user.email.trim() !== '';
  const validPassword = typeof user.password === 'string' &&
  user.password.trim() !== '' &&
  user.password.trim() >= 6;
  return validEmail && validPassword;                                          
}

router.post('/signup', (req, res) => {
  if (validateUser(req.body)) {
    res.json({
      message: 'GOOOD'
    })
  } else {
    res.status(403).json({ error: "Invalid user" })
  }
})
module.exports = router;