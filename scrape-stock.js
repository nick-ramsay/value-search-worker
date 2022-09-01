const axios = require("axios");
const cheerio = require('cheerio');

let tickerSymbol = process.argv[2];

return axios.get("https://finviz.com/quote.ashx?t=" + tickerSymbol).then((res) => {
    let $ = cheerio.load(res.data)

    let result = {
        tickerSymbol: tickerSymbol
    };

    let currentDataName = "";
    let currentDataValue = "";

    $("table.snapshot-table2 > tbody > tr > td").each((i, elem) => {
        if (i === 0 || i % 2 === 0) {
            currentDataName = $(elem).text();
        } else {
            //console.log($(elem).text().charAt($(elem).text().length - 1))
            currentDataValue = $(elem).text().charAt(0) === "-" || ["0","1","2","3","4","5","6","7","8","9"].indexOf($(elem).text().charAt(0)) !== -1 ? parseFloat($(elem).text()):$(elem).text();
            result[$(elem).text().charAt($(elem).text().length - 1) === "%" ? currentDataName + " (%)":currentDataName] = currentDataValue;
        }
    });

    console.log(result);
}).catch((err) => {console.log("ERROR: " + err.response.status + " - " + err.response.statusText)})