const tracer = require('dd-trace').init();
let fetchStats = require("./fetch-iex-stats.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchIEXStats = (currentSymbol, fullSymbolData) => {return fetchStats(currentSymbol,fullSymbolData)};

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
                        await sleep(1000);
                        fetchIEXStats(res[i].symbol, res[i].data);
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginFetching();
