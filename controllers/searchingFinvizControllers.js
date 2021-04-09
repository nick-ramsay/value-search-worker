const cheerio = require("cheerio");
const request = require("request-promise");
const axios = require("axios");
const integerArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const alphabetArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

module.exports = {
    scrapeQuoteData: function (req, res) {
        console.log("Called scrape data controller...");
        console.log(req.body);

        let selectedSymbol = req.body.symbol;
        let apiURL = "https://finviz.com/quote.ashx?t=" + selectedSymbol;
        request.get(apiURL).then(result => {
            var $ = cheerio.load(result);

            let stockDataArray = [];

            $("table.snapshot-table2 > tbody > tr > td").each((index, element) => {
                stockDataArray[index] = $(element).text();
            });

            let stockDataObject = {};
            let currentKey = "";
            let currentValue = "";

            for (let i = 0; i < stockDataArray.length; i++) {
                if (i === 0 || i % 2 === 0) {
                    currentKey = stockDataArray[i].replace(/ /g, "_");
                    // ^^^ handles the object keys
                } else {
                    // vvv Handles the Object values
                    currentValue = stockDataArray[i];
                    let lastCharacter = currentValue.slice(-1);
                    let secondLastCharacter = currentValue.charAt(currentValue.length - 2);

                    if (lastCharacter === '%' && integerArray.indexOf(Number(secondLastCharacter) !== -1)) {
                        currentValue = currentValue.replace(/%/, '');
                        currentValue = Number(currentValue) / 100;
                        stockDataObject[currentKey] = currentValue;
                    } else if (lastCharacter === "M" && integerArray.indexOf(Number(secondLastCharacter) !== -1)) {
                        currentValue = currentValue.replace(/M/, '');
                        currentValue = Number(currentValue) * 1000000;
                        stockDataObject[currentKey] = currentValue;
                    } else if (lastCharacter === "B" && integerArray.indexOf(Number(secondLastCharacter) !== -1)) {
                        currentValue = currentValue.replace(/B/, '');
                        currentValue = Number(currentValue) * 1000000000;
                        stockDataObject[currentKey] = currentValue;
                    } else {
                        let alhpabeticalCharExists = false;
                        for (let j = 0; j < currentValue.length; j++) {
                            if (alphabetArray.indexOf(currentValue.charAt(j)) !== -1) {
                                alhpabeticalCharExists = true;
                            }
                          }
                        if (alhpabeticalCharExists === true) {
                            stockDataObject[currentKey] = currentValue;
                        } else {
                            currentValue = currentValue.replace(/,/g,"");
                            stockDataObject[currentKey] = Number(currentValue);
                        }
                    }
                }
            }
            console.log(stockDataObject);
            res.json(stockDataObject);
        });
    }
}