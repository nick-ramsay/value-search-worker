const tracer = require("dd-trace").init();
const { DateTime } = require("luxon");;

let fetchQuote = require("./fetch-quote.js");

require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchIEXQuote = (currentSymbol, fullSymbolData) => {
  return fetchQuote(currentSymbol, fullSymbolData);
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const beginFetching = () => {
  mongoose.connect(uri).then(() => {
    db.StockSymbols.find({})
      .then(async (res) => {
        for (let i = 0; res.length > i; i++) {
          let currentTime = Date();
          let daydiff = 1000 * 60 * 60 * 24;

          let quoteLastUpdated = res[i].quoteLastUpdated;
          let daysSinceQuoteLastUpdated =
            (new Date(currentTime).getTime() -
              new Date(quoteLastUpdated).getTime()) /
            daydiff;

          let fundamentalsLastUpdated = res[i].fundamentalsLastUpdated;
          let daysSinceFundamentalsLastUpdated =
            (new Date(currentTime).getTime() -
              new Date(fundamentalsLastUpdated).getTime()) /
            daydiff;

          let iexStatsLastUpdated = res[i].iexStatusLastUpdated;
          let daysSinceiexStatsLastUpdated =
            (new Date(currentTime).getTime() -
              new Date(iexStatsLastUpdated).getTime()) /
            daydiff;

          let valueSearchScoreLastUpdated = res[i].valueSearchScoreLastUpdated;
          let daysSinceValueSearchScoreLastUpdated =
            (new Date(currentTime).getTime() -
              new Date(valueSearchScoreLastUpdated).getTime()) /
            daydiff;

          let currentSymbol = res[i].symbol;
          //console.log(currentSymbol);
          await sleep(1000);
          //console.log(res[i])
          /*
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
                        */

          if (
            daysSinceQuoteLastUpdated >= 1 &&
            daysSinceQuoteLastUpdated !== undefined &&
            isNaN(daysSinceQuoteLastUpdated) === false
          ) {
            fetchIEXQuote(currentSymbol, res[i].data);
            //console.log("Current Iterator: " + i);
          } else if (daysSinceQuoteLastUpdated < 1) {
            //console.log("Current Iterator: " + i);
            //console.log(res.length)
            console.log(
              "⛔️ " + currentSymbol + " quote already up-to-date ⛔️"
            );
          }
        }
        start();
      })
      .catch((err) => console.log(err));
  });
};

const initiateFetching = () => {
  let currentTimestamp = DateTime.now().setZone("America/New_York").ts
  setInterval(() => { currentTimestamp = DateTime.now().setZone("America/New_York"); console.log(currentTimestamp) }, 1000)
}

const start = () => {
  //beginFetching();
  initiateFetching();
};

start();
