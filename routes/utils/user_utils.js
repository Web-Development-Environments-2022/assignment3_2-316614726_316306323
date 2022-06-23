const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id) {
  await DButils.execQuery(
    `insert into favorites values ('${username}',${recipe_id})`
  );
}

async function markAsWatched(username, recipe_id) {
  await DButils.execQuery(
    `insert into watched values ('${username}','${recipe_id}',NOW()) ON DUPLICATE KEY UPDATE time=NOW()`
  );
}

async function getFavoriteRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipeId from favorites where username='${username}'`
  );
  return recipes_id;
}

async function getPersonalRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipeId from personal where username='${username}'`
  );
  return recipes_id;
}

async function getFamilyRecipes(username) {
  const recipes = await DButils.execQuery(
    `select * from family where username='${username}'`
  );

  for (let i = 0; i < recipes.length; i++) {
    recipes[i].ingredients = await DButils.execQuery(
      `select name,amount,unit from recipeingredients where recipeId='${recipes[i].recipeId}'`
    );
    let id = recipes[i].recipeId;
    delete recipes[i]["recipeId"];
    recipes[i]["id"] = id;
  }
  return recipes;
}

async function getLastWatches(username) {
  const lastWatches = await DButils.execQuery(
    `select recipeId from watched where username='${username}' ORDER BY time DESC LIMIT 3`
  );
  return lastWatches;
}

async function isWatched(username, recipeId) {
  let res = await DButils.execQuery(
    `select recipeId from watched where username='${username}' AND recipeId='${recipeId}'`
  );
  if (res.length == 0) {
    return false;
  }
  return true;
}
async function isFavorite(username, recipeId) {
  let res = await DButils.execQuery(
    `select recipeId from favorites where username='${username}' AND recipeId='${recipeId}'`
  );
  if (res.length == 0) {
    return false;
  }
  return true;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getPersonalRecipes = getPersonalRecipes;
exports.markAsWatched = markAsWatched;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getLastWatches = getLastWatches;
exports.isWatched = isWatched;
exports.isFavorite = isFavorite;
