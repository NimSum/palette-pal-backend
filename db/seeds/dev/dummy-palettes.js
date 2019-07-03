const dummyData = require('../seeds-data/dummyData.json');

const addProject = (knex, project) => {
  return knex('projects').insert({name: project.name}, 'id')
  .then(projectID => {
    const palPromises = [];
    project.palettes.forEach(palette => {
      palPromises.push(knex('palettes').insert({
        name: palette.name,
        color_1: palette.color_1,
        color_2: palette.color_2,
        color_3: palette.color_3,
        color_4: palette.color_4,
        color_5: palette.color_5,
        project_id: projectID[0]
      }))
    })
    return Promise.all(palPromises);
  })
  .catch(err => console.log(err))
}


exports.seed = function(knex) {
  return knex('palettes').del()
    .then(async () => {
      await knex('projects').del();
      await knex.raw('TRUNCATE TABLE palettes RESTART IDENTITY CASCADE');
      await knex.raw('TRUNCATE TABLE projects RESTART IDENTITY CASCADE');
    })
    .then(() => {
      const promises = [];
      dummyData.forEach(project => promises.push(addProject(knex, project)))
      return Promise.all(promises)
    })
}
