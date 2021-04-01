const router = require("express").Router();
const searchingFinvizControllers = require("../../controllers/searchingFinvizControllers");

router
  .route("/scrape-quote-data")
  .post(searchingFinvizControllers.scrapeQuoteData);

module.exports = router;
