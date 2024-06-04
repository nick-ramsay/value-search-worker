let fetchQuote = require("./fetch-quote.js");
let scrapeStock = require("./scrape-stock.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

//Tokens & Keys
const uri = process.env.MONGO_URI;

const fetchIEXQuote = (currentSymbol, fullSymbolData) => { return fetchQuote(currentSymbol, fullSymbolData) };
const scrapeFinviz = (currentSymbol) => { return scrapeStock(currentSymbol) };

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let symbols = [];

const refreshSymbols = () => {
    mongoose.connect(uri)
        .then(() => {
            db.StockSymbols.find(
                {}
            )
                .then(async (res) => {
                    symbols = res;
                    //console.log(symbols);
                    startChecking();
                    //setInterval(() => { checker() }, 5000);
                    //clearInterval(checker());
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

const checker = (symbol) => {

    const addLeadingZeroToMinute = (minute) => {
        let tempMinute = minute;
        if(tempMinute < 10) {
            return String("0")
        } else {
            return ""
        }
    }

    let currentTimestamp = new Date();
    let currentDayOfWeek = currentTimestamp.getDay()
    let currentHour = currentTimestamp.getHours();
    let currentMinute = currentTimestamp.getMinutes();
    let currentTime = Number(String(currentHour) + addLeadingZeroToMinute(currentMinute) + String(currentMinute));

    let eligibleDaysOfWeek = [2, 3, 4, 5, 6];
    
    let startingHour = 6;
    let startingMinute = 30;
    let startingTime = Number(String(startingHour) + addLeadingZeroToMinute(startingMinute) + String(startingMinute));

    let daysSinceQuoteUpdate = 0;
    let daysSinceLastScraped = 0;

    db.StockSymbols.find(
        { "symbol": symbol }
    )
        .then(async (res) => {
            daysSinceQuoteUpdate = (new Date().getTime() - new Date(res[0].quoteLastUpdated).getTime()) / (1000 * 60 * 60 * 24);
            daysSinceLastScraped = (new Date().getTime() - new Date(res[0].fundamentalsLastUpdated).getTime()) / (1000 * 60 * 60 * 24);

            if (eligibleDaysOfWeek.indexOf(currentDayOfWeek) !== -1 && currentTime > startingTime === true) {
                if (daysSinceQuoteUpdate >= 1) {
                    fetchIEXQuote(res[0].symbol);
                } else {
                    console.log("👍 " + res[0].symbol + " ('" + res[0].data.name + "') quote already up-to-date 👍")
                }

                if (daysSinceLastScraped >= 7 && daysSinceLastScraped !== NaN) {
                    scrapeFinviz(res[0].symbol);
                }
                else if (res[0].fundamentalsLastUpdated === undefined) {
                    scrapeFinviz(res[0].symbol);
                }
                else {
                    console.log("👍 " + res[0].symbol + " ('" + res[0].data.name + "') fundamentals already up-to-date 👍")
                }
            } else {
                console.log( "💤 [" + new Date(currentTimestamp) + "] Current Time is outside specified operating hours  💤")
            }

        })
        .catch(err => console.log(err));
};

const startChecking = async () => {
    for (let i = 0; i < symbols.length; i++) {
        await sleep(3000);
        checker(symbols[i].symbol);
        if (i === (symbols.length - 1)) {
            i = 0;
        }
    }
};

refreshSymbols();