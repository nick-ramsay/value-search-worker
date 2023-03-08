module.exports = (tickerSymbol, fullSymbolData) => {
    const tracer = require('dd-trace').init();
    
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



    axios.get("https://cloud.iexapis.com/beta/stock/" + tickerSymbol + "/stats/?&token=" + IEX_TOKEN)
        .then((res) => {

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { iexStats: res.data, symbolData: fullSymbolData, iexStatsLastUpdated: Date() },
                { upsert: true }
            )
                .then(
                    db.StockSymbols.updateOne(
                        { symbol: tickerSymbol },
                        { iexStatsLastUpdated: Date() },
                        { upsert: true }
                    )
                        .catch(err => console.log(err)),
                    console.log("🎉 Fetched '" + tickerSymbol + "' IEX Stats successfully 🎉")
                )
                .catch(err => console.log(err));

        })
        .catch((err) => {
            console.log("❌ ERROR: " + err + " ❌");
        });

}