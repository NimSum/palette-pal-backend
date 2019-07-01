const colors = [];

const getRandom = () => Math.round(Math.random() * (9 - 0) + 0);

for (i = 0; i < 25; i++) {
  const palette = [];
  for (i = 0; i < 5; i++) {
    const hex = `#${getRandom()}${getRandom()}${getRandom()}${getRandom()}${getRandom()}${getRandom()}`;
    palette.push(hex);
  }
  
  colors.push(palette);
}
console.log(colors)

// exports.seed = function(knex) {
//   // Deletes ALL existing entries
//   return knex('table_name').del()
//     .then(function () {
//       // Inserts seed entries
//       return knex('table_name').insert([
//         {id: 1, colName: 'rowValue1'},
//         {id: 2, colName: 'rowValue2'},
//         {id: 3, colName: 'rowValue3'}
//       ]);
//     });
// };
