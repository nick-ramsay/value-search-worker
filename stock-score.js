module.exports = (tickerSymbol) => {
    const tracer = require('dd-trace').init();

    require('dotenv').config()
    const axios = require("axios");
    const mongoose = require('mongoose');
    const db = require("./models");

    //Tokens & Keys
    const uri = process.env.MONGO_URI;

    //let tickerSymbol = "-H";

    mongoose.connect(uri)
        .then(() => { }/*console.log("Database Connected Successfully 👍")*/)
        .catch(err => console.log(err));

    db.StockData.find(
        { "symbol": tickerSymbol }
    ).then((stockRes) => {
        let currentStockData = stockRes[0];
        let valueSearchScoreHistory = currentStockData.valueSearchScoreHistory !== undefined ? currentStockData.valueSearchScoreHistory : [];
        let historyTimestamp = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
        //console.log(currentStockData);
        //console.log(valueSearchScoreHistory);
        //console.log(historyTimestamp)

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

        let currentPrice = currentStockData.fmpQuote !== undefined
            && isNaN(currentStockData.fmpQuote.price) === false
            && currentStockData.fmpQuote.price !== null
            ? currentStockData.fmpQuote.price : undefined;

        //console.log(tickerSymbol + " - 1 - Current Price: " + currentPrice)

        if (currentPrice === undefined) {
            currentPrice = currentStockData.fundamentals !== undefined
                && isNaN(currentStockData.fundamentals.currentPrice) === false
                && currentStockData.fundamentals.currentPrice !== null
                ? currentStockData.fundamentals.currentPrice : undefined;
        }
        //console.log(tickerSymbol + " - 2 - Current Price: " + currentPrice)


        let futurePE =
            currentStockData.fundamentals !== undefined
                && isNaN(currentStockData.fundamentals["Forward P/E"]) === false
                && currentStockData.fundamentals["Forward P/E"] !== null
                ? currentStockData.fundamentals["Forward P/E"] : undefined;
        //console.log(tickerSymbol + " - Future PE: " + futurePE)

        let profitMargin =
            currentStockData.fundamentals !== undefined
                && isNaN(currentStockData.fundamentals["Profit Margin (%)"]) === false
                && currentStockData.fundamentals["Profit Margin (%)"] !== null
                ? currentStockData.fundamentals["Profit Margin (%)"] : undefined;
        //console.log(tickerSymbol + " - Profit Margin (%) " + profitMargin)

        let currentPE = currentStockData.fmpQuote !== undefined
            && currentStockData.fmpQuote.pe !== null
            && currentStockData.fmpQuote.pe !== 0
            ? currentStockData.fmpQuote.pe : undefined;

        //console.log(tickerSymbol + " - 1 - Current PE: " + currentPE)

        if (currentPE === undefined) {
            currentPE = currentStockData.fundamentals !== undefined
                && isNaN(currentStockData.fundamentals['P/E']) === false
                && currentStockData.fundamentals['P/E'] !== null
                ? currentStockData.fundamentals['P/E'] : undefined;
        }
        //console.log(tickerSymbol + " - 2 - Current PE: " + currentPE)

        let debtEquity = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["Debt/Eq"]) === false
            && currentStockData.fundamentals["Debt/Eq"] !== null
            ? currentStockData.fundamentals["Debt/Eq"] : undefined;
        //console.log(tickerSymbol + " - Debt/Equity: " + debtEquity)


        let priceBook = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["P/B"]) === false
            && currentStockData.fundamentals["P/B"] !== null
            ? currentStockData.fundamentals["P/B"] : undefined;
        //console.log(tickerSymbol + " - P/B: " + priceBook)

        let priceSales = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["P/S"]) === false
            && currentStockData.fundamentals["P/S"] !== null
            ? currentStockData.fundamentals["P/S"] : undefined;
        //console.log(tickerSymbol + " - P/S: " + priceSales)

        let twoHundredDayMA = currentStockData.fmpQuote !== undefined
            && currentStockData.fmpQuote.priceAvg200 !== null
            && currentStockData.fmpQuote.priceAvg200 !== 0
            ? currentStockData.fmpQuote.priceAvg200 : undefined;

        //console.log(tickerSymbol + " - 1 - 200d MA: " + twoHundredDayMA)

        if (twoHundredDayMA === undefined) {
            twoHundredDayMA = currentStockData.fundamentals !== undefined
                && currentStockData.fundamentals.mva200 !== null
                ? currentStockData.fundamentals.mva200 : undefined;
        }
        //console.log(tickerSymbol + " - 2 - 200d MA: " + twoHundredDayMA)

        let fiftyDayMA = currentStockData.fmpQuote !== undefined
            && currentStockData.fmpQuote.priceAvg50 !== null
            && currentStockData.fmpQuote.priceAvg50 !== 0
            ? currentStockData.fmpQuote.priceAvg50 : undefined;

        //console.log(tickerSymbol + " - 1 - 50d MA: " + fiftyDayMA)

        if (fiftyDayMA === undefined) {
            fiftyDayMA = currentStockData.fundamentals !== undefined
                && currentStockData.fundamentals.mva50 !== null
                ? currentStockData.fundamentals.mva50 : undefined;
        }
        //console.log(tickerSymbol + " - 2 - 50d MA: " + fiftyDayMA)

        let returnOnEquity = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["ROE (%)"]) === false
            && currentStockData.fundamentals["ROE (%)"] !== null
            ? currentStockData.fundamentals["ROE (%)"] : undefined;
        //console.log(tickerSymbol + " - Return on Equity: " + returnOnEquity)

        let returnOnInvestment = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["ROI (%)"]) === false
            && currentStockData.fundamentals["ROI (%)"] !== null
            ? currentStockData.fundamentals["ROI (%)"] : undefined;
        //console.log(tickerSymbol + " - Return on Investment: " + returnOnInvestment)

        let priceToEarningsGrowth = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["PEG"]) === false
            && currentStockData.fundamentals["PEG"] !== null
            ? currentStockData.fundamentals["PEG"] : undefined;
        //console.log(tickerSymbol + " - Price/Earnings Growth: " + priceToEarningsGrowth)

        let relativeStengthIndex = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["RSI (14)"]) === false
            && currentStockData.fundamentals["RSI (14)"] !== null
            ? currentStockData.fundamentals["RSI (14)"] : undefined;
        //console.log(tickerSymbol + " - RSI: " + relativeStengthIndex)

        let earningsPerShare = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["EPS (ttm)"]) === false
            && currentStockData.fundamentals["EPS (ttm)"] !== null
            ? currentStockData.fundamentals["EPS (ttm)"] : undefined;
        //console.log(tickerSymbol + " - EPS: " + earningsPerShare)

        let earningsPerShareNextYear = currentStockData.fundamentals !== undefined
            && isNaN(currentStockData.fundamentals["EPS next Y"]) === false
            && currentStockData.fundamentals["EPS next Y"] !== null
            ? currentStockData.fundamentals["EPS next Y"] : undefined;
        //console.log(tickerSymbol + " - EPS: " + earningsPerShareNextYear)

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
            returnOnEquity: 0,
            returnOnEquityAttempted: false,
            returnOnInvestment: 0,
            returnOnInvestmentAttempted: false,
            priceToEarningsGrowth: 0,
            priceToEarningsGrowthAttempted: false,
            relativeStengthIndex: 0,
            relativeStengthIndexAttempted: false,
            earningsPerShareGrowingNextYear: 0,
            earningsPerShareGrowingNextYearAttempted: false,
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

        // - Return on Equity: Greater than or equal to 15%

        if (returnOnEquity !== undefined && Number(returnOnEquity) >= 15) {
            valueSearchScore.returnOnEquityAttempted = true;
            valueSearchScore.returnOnEquity = 1
            valueSearchScore.totalPossiblePoints += 1;
            valueSearchScore.totalCalculatedPoints += 1;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if (returnOnEquity !== undefined) {
            valueSearchScore.totalPossiblePoints += 1;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
            valueSearchScore.returnOnEquityAttempted = true;
        }

        // - Return on Investment: Greater than or equal to 10%

        if (returnOnInvestment !== undefined && Number(returnOnInvestment) >= 10.5) {
            valueSearchScore.returnOnInvestmentAttempted = true;
            valueSearchScore.returnOnInvestment = 2
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.totalCalculatedPoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if (returnOnInvestment !== undefined) {
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
            valueSearchScore.returnOnInvestmentAttempted = true;
        }

        // - Earning Per Share Greater Next Year

        if ((earningsPerShare !== undefined && earningsPerShareNextYear !== undefined) && (Number(earningsPerShareNextYear) > Number(earningsPerShare))) {
            valueSearchScore.earningsPerShareGrowingNextYearAttempted = true;
            valueSearchScore.earningsPerShareGrowingNextYear = 2
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.totalCalculatedPoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if ((earningsPerShare !== undefined && earningsPerShareNextYear !== undefined)) {
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
            valueSearchScore.earningsPerShareGrowingNextYearAttempted = true;
        }

        // - PEG

        if (priceToEarningsGrowth !== undefined && Number(priceToEarningsGrowth) <= 1) {
            valueSearchScore.priceToEarningsGrowthAttempted = true;
            valueSearchScore.priceToEarningsGrowth = 2
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.totalCalculatedPoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if (priceToEarningsGrowth !== undefined) {
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
            valueSearchScore.priceToEarningsGrowthAttempted = true;
        }


        if (relativeStengthIndex !== undefined && Number(relativeStengthIndex) <= 30) {
            valueSearchScore.relativeStengthIndexAttempted = true;
            valueSearchScore.relativeStengthIndex = 2
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.totalCalculatedPoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if (relativeStengthIndex !== undefined && Number(relativeStengthIndex) > 30 && Number(relativeStengthIndex) < 70) {
            valueSearchScore.relativeStengthIndexAttempted = true;
            valueSearchScore.relativeStengthIndex = 2
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.totalCalculatedPoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
        } else if (relativeStengthIndex !== undefined) {
            valueSearchScore.totalPossiblePoints += 2;
            valueSearchScore.calculatedScorePercentage = valueSearchScore.totalCalculatedPoints / valueSearchScore.totalPossiblePoints
            valueSearchScore.relativeStengthIndex = true;
        }

        if (currentStockData.valueSearchScoreHistory.length === 0 || currentStockData.valueSearchScoreHistory == undefined || currentStockData.valueSearchScoreHistory.findIndex(vssh => vssh.date === historyTimestamp) === -1) {
            valueSearchScoreHistory.push({ date: historyTimestamp, score: valueSearchScore.calculatedScorePercentage });
        } else if (currentStockData.valueSearchScoreHistory.findIndex(vssh => vssh.date === historyTimestamp) !== -1) {
            currentStockData.valueSearchScoreHistory[currentStockData.valueSearchScoreHistory.findIndex(vssh => vssh.date === historyTimestamp)].score = valueSearchScore.calculatedScorePercentage;
        }

        db.StockData.updateOne(
            { symbol: tickerSymbol },
            { valueSearchScore: valueSearchScore, valueSearchScoreLastUpdated: Date(), valueSearchScoreHistory: valueSearchScoreHistory },
            { upsert: true }
        )
            .then(() => {
                db.StockSymbols.updateOne(
                    { symbol: tickerSymbol },
                    { valueSearchScoreLastUpdated: Date() },
                    { upsert: true }
                )
                    .catch(err => console.log(err));

                console.log("🎉 Saved '" + tickerSymbol + "' Value Search Score successfully 🎉")
            }
            )
            .catch(err => console.log(err));
    }
    );
}