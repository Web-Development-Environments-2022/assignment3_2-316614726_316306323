const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id) {
  await DButils.execQuery(
    `insert into favorites values ('${username}',${recipe_id})`
  );
}

async function markAsWatched(username, recipe_id) {
  const currDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(currDate);
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

async function getFamilyRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipeId from family where username='${username}'`
  );
  return recipes_id;
}

async function addToFamily(username, familyData) {
  const { recipeId, owner, whenDeserved } = familyData;
  console.log(familyData);
  console.log(owner);
  console.log(whenDeserved);
  await DButils.execQuery(
    `insert into family values ('${username}','${recipeId}','${owner}','${whenDeserved}')`
  );
}

async function getLastWatches(username) {
  const lastWatches = await DButils.execQuery(
    `select recipeId from watched where username='${username}' ORDER BY time DESC LIMIT 3`
  );
  return lastWatches;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markAsWatched = markAsWatched;
exports.addToFamily = addToFamily;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getLastWatches = getLastWatches;
