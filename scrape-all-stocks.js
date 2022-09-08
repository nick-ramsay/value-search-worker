let scrapeStock = require("./scrape-stock.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const scrapeFinviz = (currentSymbol) => {return scrapeStock(currentSymbol)};

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
                        await sleep(3000);
                        scrapeFinviz(res[i].symbol);
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginScraping();
