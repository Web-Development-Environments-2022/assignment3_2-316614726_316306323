var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
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

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post("/favorites", async (req, res, next) => {
  try {
    req.session.username = "ori";
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get("/favorites", async (req, res, next) => {
  try {
    req.session.username = "ori";
    const username = req.session.username;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

// /**
//  * This path gets body with recipeId,owner,whenDeserved and save this recipe in the family list of the logged-in user
//  */
// router.post("/family", async (req, res, next) => {
//   try {
//     req.session.username = "ori";
//     const username = req.session.username;
//     const familyData = req.body.familyData;
//     await user_utils.addToFamily(username, familyData);
//     res.status(200).send("The Recipe successfully saved in family recipes!");
//   } catch (error) {
//     next(error);
//   }
// });

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get("/family", async (req, res, next) => {
  try {
    req.session.username = "ori";
    const username = req.session.username;
    const recipes_id = await user_utils.getFamilyRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last watched recipes by the current user that logged-in.
 */
router.get("/lastWatches", async (req, res, next) => {
  try {
    req.session.username = "ori";
    const username = req.session.username;
    const recipes_id = await user_utils.getLastWatches(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
