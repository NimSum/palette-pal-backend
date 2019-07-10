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
    const key = process.env.PORT 
      ? process.env.SECRET_KEY
      : 'SECRETKEYGOESHERE';
    jwt.verify(req.token, key, (err, authData) => {
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