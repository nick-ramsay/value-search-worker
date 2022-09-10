let fetchQuote = require("./fetch-quote.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchIEXQuote = (currentSymbol) => {return fetchQuote(currentSymbol)};

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
                        fetchIEXQuote(res[i].symbol);
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginFetching();
