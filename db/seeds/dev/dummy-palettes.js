const dummyData = require('../seeds-data/dummyData.json');

exports.seed = function(knex) {
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .then(async () => {
      await knex('users').del();
      await knex.raw('TRUNCATE TABLE palettes RESTART IDENTITY CASCADE');
      await knex.raw('TRUNCATE TABLE projects RESTART IDENTITY CASCADE');
      await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    })
    .then(async () => {
      const promises = [];
      promises.push(
        knex('users').insert(dummyData.users),
        knex('projects').insert(dummyData.projects),
        knex('palettes').insert(dummyData.palettes)
      )
      return Promise.all(promises)
    })
}
