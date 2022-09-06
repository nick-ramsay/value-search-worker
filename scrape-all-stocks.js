let scrapeStock = require("./scrape-stock.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const IEX_TOKEN = process.env.IEX_API_KEY;
const uri = process.env.MONGO_URI;

const scrapeFinviz = (currentSymbol) => {console.log(currentSymbol)};

mongoose.connect(uri)
    .then(() => {
        console.log("Database Connected Successfully 👍");
        db.StockSymbols.find(
            {}
        )
            .then(res => {
                for (let i = 0; i < res[i].length; i++) {

                //setTimeout(scrapeFinviz(res[i].symbol), 3000);
                        
                };
            })
            .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
