
let stockScore = require("./stock-score.js");
const calcStockScore = (currentSymbol) => { return stockScore(currentSymbol) };

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

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
                        let currentSymbol = res[i].symbol
                        await sleep(1000);
                        calcStockScore(currentSymbol);
                        await sleep(10000);
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginFetching();
