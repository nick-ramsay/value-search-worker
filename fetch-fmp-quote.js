module.exports = (tickerSymbol, fullSymbolData) => {
    const tracer = require('dd-trace').init();
    let stockScore = require("./stock-score.js");
    const calcStockScore = (currentSymbol) => { return stockScore(currentSymbol) };


    require('dotenv').config()
    const axios = require("axios");
    const mongoose = require('mongoose');
    const db = require("./models/index.js");

    //Tokens & Keys
    const FMP_TOKEN = process.env.FMP_API_KEY;
    const uri = process.env.MONGO_URI;

    //DATADOG_LOGS

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
                    message: logs,
                    type: "quote-updated",
                    symbol: tickerSymbol
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

    //let tickerSymbol = "AAAU";

    mongoose.connect(uri)
        .then(() => { }/*console.log("Database Connected Successfully 👍")*/)
        .catch(err => console.log(err));

    axios.get("https://financialmodelingprep.com/api/v3/quote/" + tickerSymbol + "?apikey=" + FMP_TOKEN)
        .then((res) => {
            let currentQuote = res.data;
            let successLog = "🎉 Fetched '" + tickerSymbol + "' quote successfully 🎉";
            let noDataLog = "⚠️ No FMP Data found for '" + tickerSymbol + "' ⚠️"

            let selectedLog = currentQuote.length === 0 ? noDataLog:successLog;

            db.StockData.updateOne(
                { symbol: tickerSymbol },
                { fmpQuote: currentQuote[0], symbolData: fullSymbolData, quoteLastUpdated: Date() },
                { upsert: true }
            )
                .then(
                    db.StockSymbols.updateOne(
                        { symbol: tickerSymbol },
                        { quoteLastUpdated: Date() },
                        { upsert: true }
                    )
                        .catch(err => console.log(err)),
                    console.log(selectedLog),
                    sendLogToDatadog(selectedLog),
                    calcStockScore(tickerSymbol)

                )
                .catch(err => console.log(err));
        })
        .catch((err) => {
            let errorLog = "❌ " + tickerSymbol + " - AXIOS ERROR: " + err + " ❌";
            sendLogToDatadog(errorLog);
            console.log(errorLog);
        });
}