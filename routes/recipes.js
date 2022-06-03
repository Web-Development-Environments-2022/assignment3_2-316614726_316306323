var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * Get 3 random recipes
 */
router.get("/getRandomRecipes", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Search Recipes
 */
router.get("/SearchRecipes", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.SearchRecipes(req.query);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/getRecipe/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipe(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
