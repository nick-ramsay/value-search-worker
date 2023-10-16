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
          console.log("Sector: " + $(elem).text());
          result.sector = $(elem).text();
        });

        $(
          "div.quote-links > div:nth-child(1) > a:nth-child(3)"
        ).each((i, elem) => {
          console.log("Industry: " + $(elem).text());
          result.industry = $(elem).text();
        });

        $(
          "div.quote-links > div:nth-child(1) > a:nth-child(5)"
        ).each((i, elem) => {
          console.log("Country: " + $(elem).text());
          result.country = $(elem).text();
        });

        $("table:nth-child(2) > tbody > tr.table-light3-row > td > div").each(
          (i, elem) => {
            console.log($(elem).text());
            result.companyDescription = $(elem).text();
          }
        );

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
            console.log(
              "🎉 Symbol '" + tickerSymbol + "' scraped successfully 🎉"
            ),
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

      console.log(
        "❌ ERROR: " +
          errorStatusCode +
          " - '" +
          tickerSymbol +
          "' " +
          errorStatusText +
          " ❌"
      );
    });
};
