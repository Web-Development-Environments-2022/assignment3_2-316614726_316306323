var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * Get 3 random recipes
 */
router.get("/getRandomRecipes", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes = await recipes_utils.getRandomRecipes(username);
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
    const username = req.session.username;
    const recipes = await recipes_utils.SearchRecipes(username, req.query);
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
    const username = req.session.username;
    const recipe = await recipes_utils.getRecipe(username, req.params.recipeId);
    username
      ? await user_utils.markAsWatched(username, req.params.recipeId)
      : null;
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets body with new recipe and saves it into the db.
 */
router.post("/createNewRecipe", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe = req.body;
    await recipes_utils.addNewRecipe(username, recipe);
    res.status(200).send("The Recipe successfully saved in personal recipes!");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
