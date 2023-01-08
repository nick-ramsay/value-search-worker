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

//1. See if I can use vanilla JS to identify 4 PM EST in New York
// current datetime string in America/Chicago timezone
let chicago_datetime_str = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

// create new Date object
let date_chicago = new Date(chicago_datetime_str);

console.log(date_chicago.getFullYear())
//2. Create test array for symbols
let dummySymbols = [
    {
        symbol: "AAPL",
        lastUpdated: new Date()
    },
    {
        symbol: "MSFT",
        lastUpdated: new Date()
    },
    {
        symbol: "GOOGL",
        lastUpdated: new Date()
    },
];

//3. Write function that will call each symbol, 
//check last updated time, then call fetchIEXQuote if symbol hasn't been updated in last 24 hours

