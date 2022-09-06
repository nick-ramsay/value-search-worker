let scrapeStock = require("./scrape-stock.js")

let tickerSymbol = process.argv[2];

    scrapeStock(tickerSymbol);
