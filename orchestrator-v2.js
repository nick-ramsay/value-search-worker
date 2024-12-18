let scrapeStock = require("./scrape-stock.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models/index.js");

const uri = process.env.MONGO_URI;
const scrapeFinviz = (currentSymbol) => { return scrapeStock(currentSymbol) };

//START: Code for sending logs to Datadog
const DATADOG_LOGS_URL = "https://http-intake.logs.datadoghq.com/api/v2/logs"

const sendLogToDatadog = async (logs) => {
    try {
        const response = await axios.post(
            DATADOG_LOGS_URL,
            {
                ddsource: 'nodejs',
                ddtags: 'env:production,version:1.0',
                service: 'value-search-worker',
                host: process.env.HOST,
                message: logs
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'DD-API-KEY': process.env.DATADOG_API_KEY,
                },
            }
        );
    } catch (error) {
        console.error('Error sending log:', error.response ? error.response.data : error.message);
    }
};

//END: Code for sending logs to Datadog
//START: Code for handling timestamps
const addLeadingZeroToMinute = (minute) => {
    let tempMinute = minute;
    if (tempMinute < 10) {
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

let daysSinceLastScraped = 0;
//END: Code for handling timestamps


let symbols = [];

const startChecking = (arr) => {
    let index = 0;

    const processItem = () => {
        //Check current symbol data
        let currentSymbol = symbols[index];
        db.StockSymbols.find(
            { "symbol": currentSymbol.symbol }
        )
            .then(async (res) => {
                // Perform desired operations on the current item

                let currentLogMessage = "";

                let currentLog = {
                    ddsource: 'nodejs',
                    ddtags: 'env:production,version:2.0',
                    message: currentLogMessage,
                    service: 'value-search-worker',
                    currentIndex: index,
                    symbol: res[0].data.symbol,
                    companyName: res[0].data.name
                };

                daysSinceLastScraped = (new Date().getTime() - new Date(res[0].fundamentalsLastUpdated).getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceLastScraped >= 7) {
                    scrapeFinviz(res[0].data.symbol);
                }
                else {
                    currentLogMessage = "👍 " + res[0].data.symbol + " already updated in the last week [" + daysSinceLastScraped + " " + (daysSinceLastScraped === 1 ? "day" : "days") + " ago]";
                    currentLog.message = currentLogMessage;
                    currentLog.daysSinceLastUpdate = daysSinceLastScraped;
                    currentLog.type = "fundamentals-up-to-date";
                    console.log(currentLogMessage);
                    sendLogToDatadog(currentLog);

                }
            })
            .catch(err => console.log(err));

        // Move to the next item or restart from the beginning
        index = (index + 1) % symbols.length;

        // Schedule the next execution
        setTimeout(processItem, 3000);
    }

    processItem(); // Start the iteration
}


const refreshSymbols = () => {
    mongoose.connect(uri)
        .then(() => {
            db.StockSymbols.find(
                {}
            )
                .then(async (res) => {
                    symbols = res;
                    startChecking(symbols)
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

refreshSymbols();