module.exports = (tickerSymbol) => {
  const tracer = require("dd-trace").init();

  const axios = require("axios");
  const cheerio = require("cheerio");

  require("dotenv").config();
  const mongoose = require("mongoose");
  const db = require("./models");
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
          type: "fundamentals-scraped",
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
    .get("https://finviz.com/quote.ashx?t=" + tickerSymbol.replace(".", "-"), {
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
          sector: null,
          industry: null,
          country: null,
          sourceURL:
            "https://finviz.com/quote.ashx?t=" +
            tickerSymbol.replace(".", "-") +
            "&ty=l&ta=0&p=m&tas=0",
          companyDescription: null,
        };

        let currentDataName = "";
        let currentDataValue = "";

        let currentPrice = undefined;
        currentPrice = Number($("div > div.quote-price_wrapper > strong").text())
        result.currentPrice = currentPrice;

        $("table.snapshot-table2 > tbody > tr > td").each((i, elem) => {
          if (i === 0 || i % 2 === 0) {
            currentDataName = $(elem).text();
          } else {
            currentDataValue =
              $(elem).text().charAt(0) === "-" ||
                ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(
                  $(elem).text().charAt(0)
                ) !== -1
                ? parseFloat($(elem).text())
                : $(elem).text();
            result[
              $(elem)
                .text()
                .charAt($(elem).text().length - 1) === "%"
                ? currentDataName + " (%)"
                : currentDataName
            ] = currentDataValue;
          }
        });

        $(
          "div.quote-links > div:nth-child(1) > a:nth-child(1)"
        ).each((i, elem) => {
          result.sector = $(elem).text();
        });

        $(
          "div.quote-links > div:nth-child(1) > a:nth-child(3)"
        ).each((i, elem) => {
          result.industry = $(elem).text();
        });

        $(
          "div.quote-links > div:nth-child(1) > a:nth-child(5)"
        ).each((i, elem) => {
          result.country = $(elem).text();
        });

        $("table:nth-child(2) > tbody > tr.table-light3-row > td > div").each(
          (i, elem) => {
            result.companyDescription = $(elem).text();
          }
        );

        let mva20 = undefined;
        let mva50 = undefined;
        let mva200 = undefined;

        if (result["SMA20 (%)"] !== undefined) {
          mva20 = currentPrice * (1 + (result["SMA20 (%)"]/100));
          result.mva20 = Number(mva20.toFixed(2));
        }

        if (result["SMA50 (%)"] !== undefined) {
          mva50 = currentPrice * (1 + (result["SMA50 (%)"]/100));
          result.mva50 = Number(mva50.toFixed(2));
        }

        if (result["SMA200 (%)"] !== undefined) {
          mva200 = currentPrice * (1 + (result["SMA200 (%)"]/100));
          result.mva200 = Number(mva200.toFixed(2));
        }

        console.log(result);

        db.StockData.updateOne(
          { symbol: tickerSymbol },
          {
            symbol: tickerSymbol,
            fundamentals: result,
            fundamentalsLastUpdated: Date(),
          },
          { upsert: true }
        )
          .then(
            db.StockSymbols.updateOne(
              { symbol: tickerSymbol },
              { fundamentalsLastUpdated: Date() },
              { upsert: true }
            ).catch((err) => console.log(err)),
            console.log(successLog),
            sendLogToDatadog(successLog),
            calcStockScore(tickerSymbol)
          )
          .catch((err) => console.log(err));
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
