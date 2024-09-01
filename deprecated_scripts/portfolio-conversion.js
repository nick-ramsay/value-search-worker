
const tracer = require('dd-trace').init();
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

const convertPortfolio = (account_id) => {
    mongoose.connect(uri)
        .then(() => {
            db.Portfolio.find(
                { account_id: account_id }
            )
                .then(async (res) => {
                    for (let i = 0; i < res[0].portfolio.length; i++) {
                        console.log(res[0].portfolio[i])
                        db.PortfolioItems.updateOne(
                            {
                                account_id: account_id,
                                symbol: res[0].portfolio[i].symbol
                            },
                            {
                                account_id: account_id,
                                symbol: res[0].portfolio[i].symbol,
                                comments: res[0].portfolio[i].comments !== undefined ? res[0].portfolio[i].comments : [],
                                labels: res[0].portfolio[i].labels !== undefined ? res[0].portfolio[i].labels : [],
                                priceTarget: res[0].portfolio[i].priceTarget !== undefined ? res[0].portfolio[i].priceTarget : 0,
                                priceTargetEnabled: res[0].portfolio[i].priceTargetEnabled !== undefined ? res[0].portfolio[i].priceTargetEnabled : false,
                                queuedForPurchase: res[0].portfolio[i].queuedForPurchase !== undefined ? res[0].portfolio[i].queuedForPurchase : false,
                                sellTarget: res[0].portfolio[i].sellTarget !== undefined ? res[0].portfolio[i].sellTarget : 0,
                                sellTargetEnabled: res[0].portfolio[i].sellTargetEnabled !== undefined ? res[0].portfolio[i].sellTargetEnabled : false,
                                status: res[0].portfolio[i].status !== undefined ? res[0].portfolio[i].status : "-"
                            },
                            {
                                upsert: true
                            }
                        ).catch(err => console.log(err));

                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

convertPortfolio("63ab8c5e70000a80fdc3a6d9");
