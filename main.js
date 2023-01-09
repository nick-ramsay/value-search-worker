//let fetchQuote = require("./fetch-quote.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchIEXQuote = (currentSymbol, fullSymbolData) => { return fetchQuote(currentSymbol, fullSymbolData) };

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
                        let currentTime = Date();
                        let daydiff = 1000 * 60 * 60 * 24;  
                        
                        let quoteLastUpdated = res[i].quoteLastUpdated;
                        let daysSinceQuoteLastUpdated = (new Date(currentTime).getTime() - new Date(quoteLastUpdated).getTime())/daydiff;

                        let fundamentalsLastUpdated = res[i].fundamentalsLastUpdated;
                        let daysSinceFundamentalsLastUpdated = (new Date(currentTime).getTime() - new Date(fundamentalsLastUpdated).getTime())/daydiff;
                        
                        let iexStatsLastUpdated = res[i].iexStatusLastUpdated;
                        let daysSinceiexStatsLastUpdated = (new Date(currentTime).getTime() - new Date(iexStatsLastUpdated).getTime())/daydiff

                        let valueSearchScoreLastUpdated = res[i].valueSearchScoreLastUpdated;
                        let daysSinceValueSearchScoreLastUpdated = (new Date(currentTime).getTime() - new Date(valueSearchScoreLastUpdated).getTime())/daydiff
                        
                        let currentSymbol = res[i].symbol
                        //console.log(currentSymbol);
                        await sleep(2000);
                        //console.log(res[i])
                        console.log("⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄" + currentSymbol + "⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄")
                        console.log(currentTime);
                        console.log("Quote: " + quoteLastUpdated);
                        console.log("Quote Diff.: " + daysSinceQuoteLastUpdated);
                        console.log("Fundamentals: " + fundamentalsLastUpdated);
                        console.log("Fundamentals Diff.: " + daysSinceFundamentalsLastUpdated);
                        console.log("IEX Stats: " + iexStatsLastUpdated);
                        console.log("IEX Stats Diff.: " + daysSinceiexStatsLastUpdated);
                        console.log("Value Search Score: " + valueSearchScoreLastUpdated);
                        console.log("Value Search Score Diff.: " + daysSinceValueSearchScoreLastUpdated);
                        console.log("-----------------------------");

                        /*db.StockData.find(
                            { "symbol": currentSymbol }
                        ).then((stockRes) => {
                            let currentStockData = stockRes[0];
                            console.log(currentStockData)
                        })
                        */
                    }
                })
                .catch(err => console.log(err));
        });
    }

    beginFetching();
