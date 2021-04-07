const cheerio = require("cheerio");
const request = require("request-promise");
const axios = require("axios");

module.exports = {
    scrapeQuoteData: function (req, res) {
        console.log("Called scrape data controller...");
        console.log(req.body);

        let selectedSymbol = req.body.symbol;
        let apiURL = "https://finviz.com/quote.ashx?t=" + selectedSymbol;
        request.get(apiURL).then(result => {
            var $ = cheerio.load(result);

            let stockDataArray = [];

            $("table.snapshot-table2 > tbody > tr > td").each((index, element) => {
                //console.log($(element).text());
                stockDataArray[index] = $(element).text();
            });

            console.log(stockDataArray);

        });
    }
}