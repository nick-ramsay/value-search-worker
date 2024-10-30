let fetchQuote = require("./fetch-quote.js");
let scrapeStock = require("./scrape-stock.js")

require('dotenv').config()
const axios = require("axios");
const mongoose = require('mongoose');
const db = require("./models");

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
                    startChecking();
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

let isEligibleDatetime = false;

const checker = (symbol, currentIndex) => {

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

    let daysSinceQuoteUpdate = 0;
    let daysSinceLastScraped = 0;

    db.StockSymbols.find(
        { "symbol": symbol }
    )
        .then(async (res) => {
            daysSinceQuoteUpdate = (new Date().getTime() - new Date(res[0].quoteLastUpdated).getTime()) / (1000 * 60 * 60 * 24);
            daysSinceLastScraped = (new Date().getTime() - new Date(res[0].fundamentalsLastUpdated).getTime()) / (1000 * 60 * 60 * 24);

            let currentCompanyName = "[NAME_UNAVAILABLE]"

            if (typeof res[0].data !== "undefined") {
                currentCompanyName = res[0].data.name;
            }

            let currentLogMessage = "";
            let currentSleepLogMessage = "";

            let currentLog = {
                ddsource: 'nodejs',
                ddtags: 'env:production,version:1.0',
                message: currentLogMessage,
                service: 'value-search-worker',
                currentIndex: currentIndex,
                symbol: res[0].symbol,
                companyName: currentCompanyName
            };

            let currentSleepLog = {
                ddsource: 'nodejs',
                ddtags: 'env:production,version:1.0',
                message: currentSleepLogMessage,
                service: 'value-search-worker'
            };

            isEligibleDatetime = eligibleDaysOfWeek.indexOf(currentDayOfWeek) !== -1 && currentTime > startingTime;

            if (isEligibleDatetime) {
                if (daysSinceQuoteUpdate >= .9) {
                    fetchIEXQuote(res[0].symbol);

                } else {
                    currentLogMessage = "👍 " + res[0].symbol + " ('" + currentCompanyName + "') quote already up-to-date 👍";
                    currentLog.message = currentLogMessage;
                    currentLog.type = "quote-up-to-date";
                    console.log(currentLogMessage);
                    sendLogToDatadog(currentLog)
                }

                if (daysSinceLastScraped >= 5.5 && daysSinceLastScraped !== NaN) {
                    scrapeFinviz(res[0].symbol);
                }
                else if (res[0].fundamentalsLastUpdated === undefined) {
                    scrapeFinviz(res[0].symbol);
                }
                else {
                    currentLogMessage = "👍 " + res[0].symbol + " ('" + currentCompanyName + "') fundamentals already up-to-date 👍"
                    currentLog.message = currentLogMessage;
                    currentLog.type = "fundamentals-up-to-date";
                    console.log(currentLogMessage);
                    sendLogToDatadog(currentLog);
                }
            } else {
                currentLogMessage = "💤 [" + new Date(currentTimestamp) + "] Current Time is outside specified operating hours  💤";
                currentSleepLogMessage = "💤 [" + new Date(currentTimestamp) + "] Current Time is outside specified operating hours  💤";
                currentLog.message = currentLogMessage;
                currentLog.type = "sleeping";
                currentSleepLog.message = currentSleepLogMessage;
                currentSleepLog.type = "sleeping";
                console.log(currentLogMessage);
                switch (isEligibleDatetime) {
                    case false:
                        sendLogToDatadog(currentSleepLog);
                        break;
                    default:
                        sendLogToDatadog(currentLog);
                }
            }

        })
        .catch(err => console.log(err));
};

const startChecking = async () => {
    for (let i = 0; i < symbols.length; i++) {

        let currentCompanyName = "[NAME_UNAVAILABLE]";

        if (typeof symbols[i].data !== "undefined") {
            currentCompanyName = symbols[i].data.name;
        }

        let orchestratorLogMessage = 'Orchestrator executed on "' + currentCompanyName + '" (' + symbols[i].symbol + ') [Index: ' + i + "]";

        const log = {
            ddsource: 'nodejs',
            host: process.env.HOST,
            ddtags: 'env:production,version:1.0',
            message: orchestratorLogMessage,
            service: 'value-search-worker',
            type: "orchestrator-heartbeat",
            currentIndex: i,
            symbol: symbols[i].symbol,
            companyName: isEligibleDatetime ? currentCompanyName : ""
        };

        let orchestratorAsleepLog = '💤 Orchestrator Currently Asleep 💤';

        const sleepLog = {
            ddsource: 'nodejs',
            host: process.env.HOST,
            ddtags: 'env:production,version:1.0',
            message: orchestratorAsleepLog,
            service: 'value-search-worker',
            type: 'orchestrator-heartbeat'
        };

        switch (isEligibleDatetime) {
            case false:
                i = 0;
                sendLogToDatadog(sleepLog)
                break;
            default:
                sendLogToDatadog(log);
        }

        await sleep(3000);

        checker(symbols[i].symbol, i);

        if (i === (symbols.length - 1)) {
            i = 0;
        }
    }
};

refreshSymbols();