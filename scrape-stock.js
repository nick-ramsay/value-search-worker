module.exports = (tickerSymbol) => {

    const axios = require("axios");
    const cheerio = require('cheerio');

    require('dotenv').config()
    const mongoose = require('mongoose');
    const db = require("./models");

    //Tokens & Keys
    const uri = process.env.MONGO_URI;

    axios.get("https://finviz.com/quote.ashx?t=" + tickerSymbol).then((res) => {
        mongoose.connect(uri).then(() => {
            let $ = cheerio.load(res.data)

            let result = {
                symbol: tickerSymbol,
                sourceURL: "https://finviz.com/quote.ashx?t=" + tickerSymbol
            };

            let currentDataName = "";
            let currentDataValue = "";

            $("table.snapshot-table2 > tbody > tr > td").each((i, elem) => {
                if (i === 0 || i % 2 === 0) {
                    currentDataName = $(elem).text();
                } else {
                    currentDataValue = $(elem).text().charAt(0) === "-" || ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf($(elem).text().charAt(0)) !== -1 ? parseFloat($(elem).text()) : $(elem).text();
                    result[$(elem).text().charAt($(elem).text().length - 1) === "%" ? currentDataName + " (%)" : currentDataName] = currentDataValue;
                }
            });

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { symbol: tickerSymbol, fundamentals: result, lastUpdated: Date() },
                { upsert: true }
            )
                .then(console.log("Symbol '" + tickerSymbol + "' fetched successfully 🎉"))
                .catch(err => console.log(err));

            console.log("🎉 Scraped '" + tickerSymbol + "' successfully 🎉");
        })
    }).catch((err) => { console.log("ERROR: " + err.response.status + " - '" + tickerSymbol + "' " + err.response.statusText) })
}