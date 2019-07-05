
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('user_id').primary();
    table.text('email').unique().notNullable();
    table.text('password').notNullable();
    table.boolean('is_active')
      .notNullable()
      .defaultTo(true)
    table.timestamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
