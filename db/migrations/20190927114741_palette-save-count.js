exports.up = function(knex) {
  return knex.schema.table('palettes', table => {
    table.integer('user_save_count').defaultTo(0);
  });
};

exports.down = function(knex) {
    return knex.schema.table('palettes', table => {
    table.dropColumn('user_save_count');
  });
};
