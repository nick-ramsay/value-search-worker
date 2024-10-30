const tracer = require('dd-trace').init();
let scrapePrice = require("./scrape-price.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models/index.js");


//Tokens & Keys
const uri = process.env.MONGO_URI;

const scrapePriceSource = (currentSymbol) => {return scrapePrice(currentSymbol)};

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const beginScraping = () => {
    mongoose.connect(uri)
        .then(() => {
            db.StockSymbols.find(
                {}
            )
                .then(async (res) => {
                    for (let i = 0; i < res.length; i++) {
                        await sleep(2000);
                        scrapePriceSource(res[i].symbol);
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginScraping();
