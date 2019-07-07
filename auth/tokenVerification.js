function verifyToken(req, res, next) {
  // get auth header value
  // TOKENT FORMAT:
  // Authorization: Bearer <token> ?? maybe not??

  const bearerHeader = req.headers.authorization;
  const token = bearerHeader.split(' ')[1];
  if (token !== undefined) {
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = verifyToken;