const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

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
  console.log(recipes_info);
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
  console.log(queryParams);
  return await axios.get(`${api_domain}/complexSearch`, {
    params: queryParams,
  });
}

async function SearchRecipes(queryParams) {
  let recipes_info = await SearchRecipesAPI(queryParams);
  return Promise.all(
    recipes_info.data.results.map((recipe) => getRecipe(recipe.id))
  );
}

exports.getRecipe = getRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.SearchRecipes = SearchRecipes;
