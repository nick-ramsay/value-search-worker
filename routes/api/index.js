const router = require("express").Router();
const searchingFinvizRoutes = require("./searchingFinvizRoutes");

// investment-tracker routes
router.use("/searching-finviz", searchingFinvizRoutes);

module.exports = router;