const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id) {
  await DButils.execQuery(
    `insert into favorites values ('${username}',${recipe_id})`
  );
}

async function markAsWatched(username, recipe_id) {
  await DButils.execQuery(
    `insert ignore into watched values ('${username}',${recipe_id})`
  );
}

async function getFavoriteRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipeId from favorites where username='${username}'`
  );
  return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
