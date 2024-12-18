const tracer = require('dd-trace').init();
let fetchQuote = require("./fetch-polygon-quote.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models/index.js");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchPolygonQuote = (currentSymbol, fullSymbolData) => {return fetchQuote(currentSymbol,fullSymbolData)};

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const beginFetching = () => {
    mongoose.connect(uri)
        .then(() => {
            db.StockSymbols.find(
                {}
            )
                .then(async (res) => {
                    for (let i = 0; i < res.length; i++) {
                        if ((new Date - res[i].quoteLastUpdated)/(1000 * 60 * 60 * 24) > .5) {
                            await sleep(1000);
                            fetchPolygonQuote(res[i].symbol, res[i].data);
                        } else {
                            console.log("🆗 " + res[i].symbol + " already updated today 🆗")
                        }
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginFetching();
