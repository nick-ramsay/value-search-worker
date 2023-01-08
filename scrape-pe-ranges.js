const axios = require("axios");
const cheerio = require('cheerio');

axios.get("https://finbox.com/aapl/explorer/pe_ltm").then((msRes) => {
    //console.log(msRes)
    let $ = cheerio.load(msRes.data);
    console.log($("#root > div > div.a34f9a00._6628f037.daf180b3._7b5c218a > div._54f4f3d2 > div.b10520ae > div:nth-child(2) > div:nth-child(2) > div._808a0544.dd197d89 > div.ca8ee078._6f0cee61 > div.de9bf6c0 > table").children("tbody"))
}).catch((msErr) => { console.log("❌ MORNINGSTAR_ERROR: " + msErr + " - '" + "AAPL" + "' " + msErr + " ❌") });

