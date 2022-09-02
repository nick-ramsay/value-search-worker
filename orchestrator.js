let scrapeStock = require("./scrape-stock.js")

setInterval(() => {
    console.log(Date());
    scrapeStock('AAPL');
},6000)