const db = require('../db');

function checkIfUserPalette(req, res, next) {
  const userId = parseInt(res.auth.user.id);
  const selectProjects = `SELECT proj.user_id, proj.id AS project_id FROM projects AS proj LEFT JOIN palettes AS pal ON pal.project_id = proj.id WHERE pal.id IN (${req.params.id})`;
  db.raw(selectProjects)
    .then(result => {
      const userIsOwner = result.rows.some(proj => userId === proj.user_id);
      
      if (userIsOwner) {
        next();
      } else {
        res.status(403).json({ error: "Not a user palette"})
      }
    });
}

module.exports = checkIfUserPalette;