module.exports = (tickerSymbol) => {

    require('dotenv').config()
    const axios = require("axios");
    const mongoose = require('mongoose');
    const db = require("./models");

    //Tokens & Keys
    const IEX_TOKEN = process.env.IEX_API_KEY;
    const uri = process.env.MONGO_URI;

    //let tickerSymbol = "AAAU";

    mongoose.connect(uri)
        .then(() => {}/*console.log("Database Connected Successfully 👍")*/)
        .catch(err => console.log(err));

    axios.get("https://cloud.iexapis.com/beta/stock/" + tickerSymbol + "/quote/?&token=" + IEX_TOKEN)
        .then((res) => {
            let currentQuote = res.data;

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { quote: currentQuote, quoteLastUpdated: Date() },
                { upsert: true }
            )
                .then(console.log("Symbol '" + tickerSymbol + "' fetched successfully 🎉"))
                .catch(err => console.log(err));

            console.log("🎉 Fetched '" + tickerSymbol + "' quote successfully 🎉");
        })
        .catch((err) => {
            console.log("AXIOS ERROR: " + err);
        });
}