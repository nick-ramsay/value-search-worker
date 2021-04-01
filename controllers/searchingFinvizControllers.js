const cheerio = require("cheerio");
const axios = require('axios');

module.exports = {
    scrapeQuoteData: function (req, res) {
        console.log("Called scrape data controller...");
        console.log(req.body);
    }
}