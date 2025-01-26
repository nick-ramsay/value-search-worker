const tracer = require('dd-trace').init();
require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const FMP_API_KEY = process.env.FMP_API_KEY;
const IEX_TOKEN = process.env.IEX_API_KEY;
const uri = process.env.MONGO_URI;


mongoose.connect(uri)
    .then(() => console.log("Database Connected Successfully 👍"))
    .catch(err => console.log(err));

axios.get("https://financialmodelingprep.com/api/v3/stock/list?apikey=" + FMP_API_KEY)
    .then((res) => {
        let allStockSymbols = res.data;
        for (let i = 0; i < allStockSymbols.length; i++) {
            setTimeout(() => {
                db.FmpStockSymbols.updateOne(
                    { symbol: allStockSymbols[i].symbol },
                    { symbol: allStockSymbols[i].symbol, data: allStockSymbols[i], lastUpdated: Date() },
                    { upsert: true }
                )
                    .then(console.log("Symbol '" + allStockSymbols[i].symbol + "' fetched successfully 🎉"))
                    .catch(err => console.log(err));
            }, 100);
        }
        console.log("🏁 Script Complete 🏁");
        //process.exit();
    })
    .catch((err) => {
        console.log("AXIOS ERROR: '" + err + "'")
    });