module.exports = (tickerSymbol, fullSymbolData) => {
    const tracer = require('dd-trace').init();
    let stockScore = require("./stock-score.js");
    const calcStockScore = (currentSymbol) => { return stockScore(currentSymbol) };


    require('dotenv').config()
    const axios = require("axios");
    const mongoose = require('mongoose');
    const db = require("./models");

    //Tokens & Keys
    const IEX_TOKEN = process.env.IEX_API_KEY;
    const uri = process.env.MONGO_URI;

    //let tickerSymbol = "AAAU";

    mongoose.connect(uri)
        .then(() => { }/*console.log("Database Connected Successfully 👍")*/)
        .catch(err => console.log(err));

    axios.get("https://cloud.iexapis.com/beta/stock/" + tickerSymbol + "/quote/?&token=" + IEX_TOKEN)
        .then((res) => {
            let currentQuote = res.data;

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { quote: currentQuote, symbolData: fullSymbolData, quoteLastUpdated: Date() },
                { upsert: true }
            )
                .then(
                    db.StockSymbols.updateOne(
                        { symbol: tickerSymbol },
                        { quoteLastUpdated: Date() },
                        { upsert: true }
                    )
                        .catch(err => console.log(err)),
                    console.log("🎉 Fetched '" + tickerSymbol + "' quote successfully 🎉"),
                    calcStockScore(tickerSymbol)
                    
                )
                .catch(err => console.log(err));
        })
        .catch((err) => {
            console.log("❌ AXIOS ERROR: " + err + " ❌");
        });
}