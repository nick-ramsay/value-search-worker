require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const IEX_TOKEN = process.env.IEX_API_KEY;
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log("Database Connected Successfully 👍"))
    .catch(err => console.log(err));

axios.get("https://cloud.iexapis.com/beta/ref-data/symbols?&token=" + IEX_TOKEN)
    .then((res) => {

        for (let i = 0; i < res.data.length; i++) {
            db.StockSymbols.updateOne(
                { symbol: res.data[i].symbol },
                { symbol: res.data[i].symbol, data: res.data[i], lastUpdated: Date() },
                { upsert: true }
            )
            .then(console.log("Symbol '" + res.data[i].symbol + "' fetched successfully 🎉"))
            .catch(err => console.log(err));
        }
        console.log("🏁 Script Complete 🏁");
        process.exit();
    })
    .catch((err) => {
        console.log("AXIOS ERROR: " + err.response.status + " - " + err.response.statusText)
    });