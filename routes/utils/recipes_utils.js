const axios = require("axios");
const { NodeBaseExport } = require("readable-stream");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");

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

async function getRecipePreview(recipe_id) {
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
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
  };
}

async function checkPersonalRecipe(username, recipe_id) {
  let recipe = await DButils.execQuery(
    `SELECT recipeId FROM personal WHERE username='${username}' AND recipeId='${recipe_id}'`
  );
  return recipe.recipeId;
}

async function getRecipeInformationDB(recipe_id) {
  let recipe = await DButils.execQuery(
    `SELECT * FROM newrecipe WHERE recipeId='${recipe_id}'`
  );
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
  let recipeFound = await checkPersonalRecipe(username, recipe_id); // checks if the user has the specific recipe id
  if (recipeFound) {
    let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
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
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
    ingredients: extendedIngredients,
    servings: servings,
    instructions: instructions,
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

async function getRandomRecipes() {
  let recipes_info = await getRandomRecipesAPI();
  let recipes = [];
  recipes_info.data.recipes.map((recipe) => {
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

    recipes.push({
      id: id,
      title: title,
      readyInMinutes: readyInMinutes,
      image: image,
      popularity: aggregateLikes,
      vegan: vegan,
      vegetarian: vegetarian,
      glutenFree: glutenFree,
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

async function SearchRecipes(queryParams) {
  let recipes_info = await SearchRecipesAPI(queryParams);
  recipesId = [];
  recipes_info.data.results.map((recipe) => recipesId.push(recipe.id));
  return getRecipesPreview(recipesId);
}

async function getRecipesPreview(recipesArray) {
  return Promise.all(
    recipesArray.map((recipeId) => getRecipePreview(recipeId))
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
    await DButils.execQuery(
      `insert ignore into newrecipes values ('NULL','${image}','${title}','${readyInMinutes}','${popularity}',
      '${isVegan ? 1 : 0}','${isGlutenFree ? 1 : 0}','${
        isVegetarian ? 1 : 0
      }','${servings}','${instructions}')`
    );

    let id = await DButils.execQuery(
      `SELECT * FROM newrecipes ORDER BY recipeId DESC LIMIT 0, 1`
    );
    id = id[0].recipeId;

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
