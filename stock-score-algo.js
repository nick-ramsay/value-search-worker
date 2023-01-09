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
                        let currentSymbol = res[i].symbol
                        //console.log(currentSymbol);
                        await sleep(2000);
                        db.StockData.find(
                            { "symbol": currentSymbol }
                        ).then((stockRes) => {
                            let currentStockData = stockRes[0];
                            /* Scoring Attributes:
                             - PE Ratio: Greater than 0, less than/equal to 15
                             - Future PE: Greater than 0, less than/equal to 15
                             - Future PE is Greater than Current PE
                             - Debt/Equity: Greater than/equal to 0, less than/equal to 2
                             - Price/Book: Greater than/equal to 0.95, less than/equal to 1.1
                             - Price-to-Sales: Greater than/equal to 0, less than/equal to 2
                             - Moving Average #1: If current price is less than 200d MA and 50d MA is less than 200d MA 
                             - Moving Average #2:  ((50d MA * 1. >= current price) && (50d MA * .95 <= current price)
                            */
                            let currentPrice =
                                currentStockData.quote !== undefined
                                    && isNaN(currentStockData.quote.latestPrice) === false
                                    && currentStockData.quote.latestPrice !== null
                                    ? currentStockData.quote.latestPrice : undefined;
                            console.log(currentSymbol + " - Current Price: " + currentPrice)


                            let futurePE =
                                currentStockData.fundamentals !== undefined
                                    && isNaN(currentStockData.fundamentals["Forward P/E"]) === false
                                    && currentStockData.fundamentals["Forward P/E"] !== null
                                    ? currentStockData.fundamentals["Forward P/E"] : undefined;
                            console.log(currentSymbol + " - Future PE: " + futurePE)

                            let profitMargin =
                                currentStockData.fundamentals !== undefined
                                    && isNaN(currentStockData.fundamentals["Profit Margin (%)"]) === false
                                    && currentStockData.fundamentals["Profit Margin (%)"] !== null
                                    ? currentStockData.fundamentals["Profit Margin (%)"] : undefined;
                            console.log(currentSymbol + " - Profit Margin (%) " + profitMargin)

                            let currentPE = currentStockData.quote !== undefined
                                && currentStockData.quote.peRatio !== null
                                ? currentStockData.quote.peRatio : undefined;
                            console.log(currentSymbol + " - Current PE: " + currentPE)

                            let debtEquity = currentStockData.fundamentals !== undefined
                                && isNaN(currentStockData.fundamentals["Debt/Eq"]) === false
                                && currentStockData.fundamentals["Debt/Eq"] !== null
                                ? currentStockData.fundamentals["Debt/Eq"] : undefined;
                            console.log(currentSymbol + " - Debt/Equity: " + debtEquity)


                            let priceBook = currentStockData.fundamentals !== undefined
                                && isNaN(currentStockData.fundamentals["P/B"]) === false
                                && currentStockData.fundamentals["P/B"] !== null
                                ? currentStockData.fundamentals["P/B"] : undefined;
                            console.log(currentSymbol + " - P/B: " + priceBook)

                            let priceSales = currentStockData.fundamentals !== undefined
                                && isNaN(currentStockData.fundamentals["P/S"]) === false
                                && currentStockData.fundamentals["P/S"] !== null
                                ? currentStockData.fundamentals["P/S"] : undefined;
                            console.log(currentSymbol + " - P/S: " + priceSales)

                            let twoHundredDayMA = currentStockData.iexStats !== undefined
                                && currentStockData.iexStats.day200MovingAvg !== null
                                ? currentStockData.iexStats.day200MovingAvg : undefined;
                            console.log(currentSymbol + " - 200d MA: " + twoHundredDayMA)

                            let fiftyDayMA = currentStockData.iexStats !== undefined
                                && currentStockData.iexStats.day50MovingAvg !== null
                                ? currentStockData.iexStats.day50MovingAvg : undefined;
                            console.log(currentSymbol + " - 50d MA: " + fiftyDayMA)

                            let valueSearchScore = {
                                healthyPE: 0,
                                healthyPEAttempted: false,
                                healthyFuturePE: 0,
                                healthyFuturePEAttempted: false,
                                profitMarginPositive: 0,
                                profitMarginPositiveAttempted: false,
                                forwardPEGreater: 0,
                                forwardPEGreaterAttempted: false,
                                healthyDebtEquity: 0,
                                healthyDebtEquityAttempted: false,
                                healthyPriceBook: 0,
                                healthyPriceBookAttempted: false,
                                healthyPriceSales: 0,
                                healthyPriceSalesAttempted: false,
                                movingAveragesGreaterThanPrice: 0,
                                movingAveragesGreaterThanPriceAttempted: false,
                                movingAverageSupport: 0,
                                movingAverageSupportAttempted: false,
                                totalCalculatedPoints: 0,
                                totalPossiblePoints: 0,
                                calculatedScorePercentage: 0
                            }
                            //- PE Ratio: Greater than 0, less than/equal to 15

                            if (currentPE !== undefined && Number(currentPE) > 0 && Number(currentPE) <= 15) {
                                valueSearchScore.healthyPEAttempted = true;
                                valueSearchScore.healthyPE = 1;
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (currentPE !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.healthyPEAttempted = true;

                            }
                            // - Future PE: Greater than 0, less than/equal to 15

                            if (futurePE !== undefined && Number(futurePE) > 0 && Number(futurePE) <= 15) {
                                valueSearchScore.healthyFuturePEAttempted = true;
                                valueSearchScore.healthyFuturePE = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (futurePE !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.healthyFuturePEAttempted = true;

                            }
                            //Positive Profit Margin
                            if (profitMargin !== undefined && Number(profitMargin) > 0) {
                                valueSearchScore.profitMarginPositiveAttempted = true;
                                valueSearchScore.profitMarginPositive = 2;
                                valueSearchScore.totalPossiblePoints += 2;
                                valueSearchScore.totalCalculatedPoints += 2;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (currentPE !== undefined) {
                                valueSearchScore.totalPossiblePoints += 2
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.profitMarginPositiveAttempted = true;

                            }
                            // - Future PE is Greater than Current PE

                            if ((futurePE !== undefined && currentPE !== undefined) && (Number(futurePE) >= Number(currentPE))) {
                                valueSearchScore.forwardPEGreaterAttempted = true;
                                valueSearchScore.forwardPEGreater = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if ((futurePE !== undefined && currentPE !== undefined)) {
                                valueSearchScore.totalPossiblePoints += 1
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.forwardPEGreaterAttempted = true;
                            }

                            // - Debt/Equity: Greater than/equal to 0, less than/equal to 2

                            if (debtEquity !== undefined && Number(debtEquity) >= 0 && Number(debtEquity) <= 2) {
                                valueSearchScore.healthyDebtEquityAttempted = true;
                                valueSearchScore.healthyDebtEquity = 2
                                valueSearchScore.totalPossiblePoints += 2;
                                valueSearchScore.totalCalculatedPoints += 2;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (debtEquity !== undefined) {
                                valueSearchScore.totalPossiblePoints += 2;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.healthyDebtEquityAttempted = true;
                            }

                            // - Price/Book: Greater than/equal to 0.95, less than/equal to 1.1

                            if (priceBook !== undefined && Number(priceBook) >= 0.95 && Number(priceBook) <= 1.1) {
                                valueSearchScore.healthyPriceBookAttempted = true;
                                valueSearchScore.healthyPriceBook = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (priceBook !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.healthyPriceBookAttempted = true;
                            }
                            // - Price-to-Sales: Greater than/equal to 0, less than/equal to 2
                            if (priceSales !== undefined && Number(priceSales) >= 0 && Number(priceSales) <= 2) {
                                valueSearchScore.healthyPriceSalesAttempted = true;
                                valueSearchScore.healthyPriceSales = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (priceSales !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.healthyPriceSalesAttempted = true;
                            }

                            // - Moving Average #1: If current price is less than 200d MA and 50d MA is less than 200d MA 
                            if ((twoHundredDayMA !== undefined && fiftyDayMA !== undefined && currentPrice !== undefined) && (Number(twoHundredDayMA) > Number(currentPrice) && Number(twoHundredDayMA) > Number(fiftyDayMA))) {
                                valueSearchScore.movingAveragesGreaterThanPriceAttempted = true;
                                valueSearchScore.movingAveragesGreaterThanPrice = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (twoHundredDayMA !== undefined && fiftyDayMA !== undefined && currentPrice !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.movingAveragesGreaterThanPriceAttempted = true;
                            }
                            // - Moving Average Support #2:  ((50d MA * 1.1 >= current price) && (50d MA * .95 <= current price)

                            if ((twoHundredDayMA !== undefined && fiftyDayMA !== undefined && currentPrice !== undefined) && (Number(twoHundredDayMA) > Number(fiftyDayMA) && (Number(fiftyDayMA) * .95) <= Number(currentPrice))) {
                                valueSearchScore.movingAverageSupportAttempted = true;
                                valueSearchScore.movingAverageSupport = 1
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.totalCalculatedPoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                            } else if (twoHundredDayMA !== undefined && fiftyDayMA !== undefined && currentPrice !== undefined) {
                                valueSearchScore.totalPossiblePoints += 1;
                                valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
                                valueSearchScore.movingAverageSupportAttempted = true;
                            }

                            console.log(Object(valueSearchScore))

                            db.StockData.updateOne(
                                { symbol: currentSymbol },
                                { valueSearchScore: valueSearchScore, valueSearchScoreLastUpdated: Date() },
                                { upsert: true }
                            )
                                .then(
                                    console.log("🎉 Saved '" + currentSymbol + "' Value Search Score successfully 🎉")
                                    )
                                .catch(err => console.log(err));
                        }

                        )
                    };
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

beginFetching();
