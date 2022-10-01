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
                sector: null,
                industry: null,
                country:null,
                sourceURL: "https://finviz.com/quote.ashx?t=" + tickerSymbol + "&ty=l&ta=0&p=m&tas=0"
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

            $("table.fullview-title > tbody > tr:nth-child(3) > td > a:nth-child(1)").each((i,elem) => {
                result.sector = $(elem).text();
            });

            $("table.fullview-title > tbody > tr:nth-child(3) > td > a:nth-child(2)").each((i,elem) => {
                result.industry = $(elem).text();
            });

            $("table.fullview-title > tbody > tr:nth-child(3) > td > a:nth-child(3)").each((i,elem) => {
                result.country = $(elem).text();
            });

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { symbol: tickerSymbol, fundamentals: result, fundamentalsLastUpdated: Date() },
                { upsert: true }
            )
                .then(
                    db.StockSymbols.updateOne(
                        { symbol: tickerSymbol },
                        { fundamentalsLastUpdated: Date() },
                        { upsert: true }
                    )
                    .catch(err => console.log(err)),
                    console.log("🎉 Symbol '" + tickerSymbol + "' scraped successfully 🎉")
                )
                .catch(err => console.log(err));
        })
    }).catch((err) => { console.log("❌ ERROR: " + err.response.status + " - '" + tickerSymbol + "' " + err.response.statusText + " ❌") })
}