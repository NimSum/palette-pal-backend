const db = require('../db');

function checkIfUserProject(req, res, next) {
  const userId = parseInt(res.auth.user.id);
  const selectProjects = `SELECT proj.id AS project_id FROM projects AS proj WHERE proj.user_id IN (${userId})`;

  db.raw(selectProjects)
    .then(result => {
      const userIsOwner = result.rows.some(proj => proj.project_id === parseInt(req.params.id));
      if (userIsOwner) {
        next();
      } else {
        res.status(404).json({ error: "Not a user project or invalid id"})
      }
    });
}

module.exports = checkIfUserProject;