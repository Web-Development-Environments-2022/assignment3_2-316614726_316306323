const axios = require("axios");
const { NodeBaseExport } = require("readable-stream");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const user_utils = require("./user_utils");

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */

async function getRecipeInformationAPI(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

async function getRecipePreview(username, recipe_id) {
  let personalRecipeFound = username
    ? await checkPersonalRecipe(username, recipe_id)
    : false; // checks if the user has the specific recipe id
  let isWatched = username
    ? await user_utils.isWatched(username, recipe_id)
    : false;
  let isFavorite = username
    ? await user_utils.isFavorite(username, recipe_id)
    : false;

  if (personalRecipeFound) {
    let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
    return {
      id: recipe.id,
      title: recipe.title,
      readyInMinutes: recipe.prepTimeInMinutes,
      image: recipe.image,
      popularity: recipe.popularity,
      isVegan: recipe.isVegan,
      isVegetarian: recipe.isVegetarian,
      isGlutenFree: recipe.isGlutenFree,
      isWatched: isWatched,
      isFavorite: isFavorite,
    };
  }

  let recipe_info = await getRecipeInformationAPI(recipe_id);
  let {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
  } = recipe_info.data;

  return {
    id: id,
    title: title,
    readyInMinutes: readyInMinutes,
    image: image,
    popularity: aggregateLikes,
    isVegan: vegan,
    isVegetarian: vegetarian,
    isGlutenFree: glutenFree,
    isWatched: isWatched,
    isFavorite: isFavorite,
  };
}

async function checkPersonalRecipe(username, recipe_id) {
  let recipe = await DButils.execQuery(
    `SELECT recipeId FROM personal WHERE username='${username}' AND recipeId='${recipe_id}'`
  );
  return recipe[0] ? true : false;
}

async function getRecipeInformationDB(recipe_id) {
  let recipe = await DButils.execQuery(
    `SELECT * FROM newrecipes WHERE recipeId='${recipe_id}'`
  );
  recipe = recipe[0];
  recipe.isVegan = recipe.isVegan == 1;
  recipe.isVegetarian = recipe.isVegetarian == 1;
  recipe.isGlutenFree = recipe.isGlutenFree == 1;
  let ing = await getIngredientsRecipeDB(recipe_id);
  recipe.ingredients = ing;
  return recipe;
}

async function getIngredientsRecipeDB(recipe_id) {
  let recipeIng = await DButils.execQuery(
    `SELECT ingredient,quantity,units FROM recipeingredients WHERE recipeId='${recipe_id}'`
  );
  return recipeIng;
}

async function getRecipe(username, recipe_id) {
  let personalRecipeFound = username
    ? await checkPersonalRecipe(username, recipe_id)
    : false; // checks if the user has the specific recipe id
  let isWatched = username
    ? await user_utils.isWatched(username, recipe_id)
    : false;
  let isFavorite = username
    ? await user_utils.isFavorite(username, recipe_id)
    : false;

  if (personalRecipeFound) {
    let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
    recipe.isWatched = isWatched;
    recipe.isFavorite = isFavorite;
    return recipe;
  }

  recipe_info = await getRecipeInformationAPI(recipe_id);
  let {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
    extendedIngredients,
    servings,
    instructions,
  } = recipe_info.data;

  return {
    id: id,
    title: title,
    readyInMinutes: readyInMinutes,
    image: image,
    popularity: aggregateLikes,
    isVegan: vegan,
    isVegetarian: vegetarian,
    isGlutenFree: glutenFree,
    ingredients: extendedIngredients,
    servings: servings,
    instructions: instructions,
    isWatched: isWatched,
    isFavorite: isFavorite,
  };
}

async function getRandomRecipesAPI() {
  return await axios.get(`${api_domain}/random`, {
    params: {
      number: 3,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

async function getRandomRecipes(username) {
  let recipes_info = await getRandomRecipesAPI();
  let recipes = [];
  recipes_info.data.recipes.map(async (recipe) => {
    let {
      id,
      title,
      readyInMinutes,
      image,
      aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
    } = recipe;

    let isWatched = username ? await user_utils.isWatched(username, id) : false;
    let isFavorite = username
      ? await user_utils.isFavorite(username, id)
      : false;

    recipes.push({
      id: id,
      title: title,
      readyInMinutes: readyInMinutes,
      image: image,
      popularity: aggregateLikes,
      isVegan: vegan,
      isVegetarian: vegetarian,
      isGlutenFree: glutenFree,
      isWatched: isWatched,
      isFavorite: isFavorite,
    });
  });

  return recipes;
}

async function SearchRecipesAPI(queryParams) {
  queryParams["apiKey"] = process.env.spooncular_apiKey;
  queryParams["number"] ? null : (queryParams["number"] = 5);
  return await axios.get(`${api_domain}/complexSearch`, {
    params: queryParams,
  });
}

async function SearchRecipes(username, queryParams) {
  let recipes_info = await SearchRecipesAPI(queryParams);
  recipesId = [];
  recipes_info.data.results.map((recipe) => recipesId.push(recipe.id));
  let resultRecipes = await getRecipesPreview(username, recipesId);
  resultRecipes = await addInstructionsToRecipes(resultRecipes);
  return resultRecipes;
}

async function addInstructionsToRecipes(recipes) {
  for (let i = 0; i < recipes.length; i++) {
    let recipeAPI = await getRecipe(null, recipes[i].id);
    recipes[i].instructions = recipeAPI.instructions;
  }
  return recipes;
}

async function getRecipesPreview(username, recipesArray) {
  return Promise.all(
    recipesArray.map((recipeId) => getRecipePreview(username, recipeId))
  );
}

async function addNewRecipe(username, recipe) {
  let {
    title,
    readyInMinutes,
    image,
    popularity,
    isVegan,
    isVegetarian,
    isGlutenFree,
    ingredients,
    servings,
    instructions,
  } = recipe;

  try {
    let id = await DButils.execQuery(
      `SELECT * FROM newrecipes ORDER BY recipeId ASC LIMIT 0, 1`
    );
    id = id[0] ? id[0].recipeId - 1 : -1000;

    await DButils.execQuery(
      `insert ignore into newrecipes values ('${id}','${image}','${title}','${readyInMinutes}','${popularity}',
      '${isVegan ? 1 : 0}','${isGlutenFree ? 1 : 0}','${
        isVegetarian ? 1 : 0
      }','${servings}','${instructions}')`
    );

    await DButils.execQuery(
      `insert ignore into personal values ('${username}','${id}')`
    );

    for (let i = 0; i < ingredients.length; i++) {
      let ing = ingredients[i];
      await DButils.execQuery(
        `insert into recipeingredients values ('${id}','${ing.name}','${ing.quantity}','${ing.units}')`
      );
    }
  } catch (err) {
    return err;
  }
}

exports.addNewRecipe = addNewRecipe;
exports.getRecipePreview = getRecipePreview;
exports.getRecipe = getRecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomRecipes = getRandomRecipes;
exports.SearchRecipes = SearchRecipes;
