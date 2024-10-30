module.exports = (tickerSymbol) => {
  const tracer = require("dd-trace").init();

  const axios = require("axios");
  const cheerio = require("cheerio");

  require("dotenv").config();
  const mongoose = require("mongoose");
  const db = require("./models/index.js");
  let stockScore = require("./stock-score.js");
  const calcStockScore = (currentSymbol) => {
    return stockScore(currentSymbol);
  };

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
          type: "price-scraped",
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


  //Tokens & Keys
  const uri = process.env.MONGO_URI;

  axios
    .get("https://finance.yahoo.com/quote/" + tickerSymbol.replace(".", "-"), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      },
    })
    .then((res) => {
      mongoose.connect(uri).then(() => {
        let $ = cheerio.load(res.data);
        let successLog = "🎉 Symbol '" + tickerSymbol + "' scraped successfully 🎉";

        let result = {
          symbol: tickerSymbol,
          sourceURL:
            "https://finance.yahoo.com/quote/" + tickerSymbol.replace(".", "-")
          
        };

        //let selector = "fin-streamer[data-symbol='" + tickerSymbol + "']";
        //console.log(selector)

        console.log($('fin-streamer[data-field=""]').first().text())



      //   db.StockData.updateOne(
      //     { symbol: tickerSymbol },
      //     {
      //       symbol: tickerSymbol,
      //       fundamentals: result,
      //       fundamentalsLastUpdated: Date(),
      //     },
      //     { upsert: true }
      //   )
      //     .then(
      //       db.StockSymbols.updateOne(
      //         { symbol: tickerSymbol },
      //         { fundamentalsLastUpdated: Date() },
      //         { upsert: true }
      //       ).catch((err) => console.log(err)),
      //       console.log(successLog),
      //       sendLogToDatadog(successLog),
      //       calcStockScore(tickerSymbol)
      //     )
      //     .catch((err) => console.log(err));
       });
    })
    .catch((err) => {
      let errorStatusCode =
        err !== undefined && err.response !== undefined
          ? err.response.status
          : "Unknown Status Code";
      let errorStatusText =
        err !== undefined && err.response !== undefined
          ? err.response.statusText
          : "Unknown Error Text";

      let errorLog =
        "❌ ERROR: " +
        errorStatusCode +
        " - '" +
        tickerSymbol +
        "' " +
        errorStatusText +
        " ❌";
      db.StockSymbols.updateOne(
        { symbol: tickerSymbol },
        { fundamentalsLastUpdated: Date() },
        { upsert: true }
      ).catch((err) => console.log(err));
      console.log(errorLog);
      sendLogToDatadog(errorLog)
    });
};
