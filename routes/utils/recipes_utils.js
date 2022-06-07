const axios = require("axios");
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

async function getRecipe(recipe_id) {
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

async function addNewRecipe(username,recipe){
  // fix the add recipe method and add the ingredients to the ing-table
  // check family get
  // get personal
  {
    title,
    readyInMinutes,
    image,
    popularity,
    isVegan,
    isVegetarian,
    isGlutenFree,
    extendedIngredients,
    servings,
    instructions
  } = recipe;

  await DButils.execQuery(
    `insert ignore into newrecipes values ('${image}','${title}','${readyInMinutes}','${popularity}','${isVegan}','${isVegetarian}','${isGlutenFree}','${servings}','${instructions}')`
  );

  await DButils.execQuery(
    `insert ignore into personal values ('${username}','${id}')`
  );
  
}


exports.getRecipePreview = getRecipePreview;
exports.getRecipe = getRecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomRecipes = getRandomRecipes;
exports.SearchRecipes = SearchRecipes;
