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
                stockDataArray[index] = $(element).text();
            });

            let stockDataObject = {};
            let currentKey = "";
            let currentValue = "";

            for (let i = 0; i < stockDataArray.length;i++) {
                if (i === 0 || i % 2 === 0) {
                    currentKey = stockDataArray[i].replace(/ /g,"_");
                } else {
                    currentValue = stockDataArray[i];
                    stockDataObject[currentKey] = currentValue;
                }
            }
            console.log(stockDataObject);
        });
    }
}