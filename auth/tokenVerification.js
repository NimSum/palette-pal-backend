function verifyToken(req, res, next) {
  // get auth header value
  // TOKENT FORMAT:
  // Authorization: Bearer <token> ?? maybe not??

  const token = req.headers.authorization;
  if (token !== undefined) {
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = verifyToken;