const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // get auth header value
  // TOKENT FORMAT:
  // Authorization: Bearer <token> 
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

module.exports = verifyToken;