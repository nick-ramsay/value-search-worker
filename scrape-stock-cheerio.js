const axios = require("axios");
const cheerio = require('cheerio');

axios.get("https://finviz.com/quote.ashx?t=AAPL").then((res) => {
    let $ = cheerio.load(res.data)

    $(".snapshot-table2 tbody tr").each((i, elem) => {
        console.log(i);
    });
    //console.log(table.html());
})

