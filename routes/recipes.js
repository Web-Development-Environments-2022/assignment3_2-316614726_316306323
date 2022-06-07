var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const DButils = require("./utils/DButils");

/**
 * Authenticate all incoming requests by middleware - MAYBE NEED TO DELETE TODO
 */
router.use(async function (req, res, next) {
  req.session.username = "ori";
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users")
      .then((users) => {
        if (users.find((x) => x.username === req.session.username)) {
          req.username = req.session.username;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

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
    const username = req.session.username;
    await user_utils.markAsWatched(username, req.params.recipeId);
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
    req.session.username = "ori";
    const username = req.session.username;
    const recipe = req.body.recipe;
    await recipes_utils.addNewRecipe(username, recipe);
    res.status(200).send("The Recipe successfully saved in family recipes!");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
