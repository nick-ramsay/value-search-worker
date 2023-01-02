const axios = require("axios");
const cheerio = require('cheerio');

axios.get("https://www.macrotrends.net/stocks/charts/AAPL/apple/pe-ratio").then((msRes) => {
    //console.log(msRes)
    let $ = cheerio.load(msRes);
    console.log($("").attr("aria-label"))
    /*$(".amcharts-stock-panel-div-stockPanel2").each((i,elem) => {
        console.log(elem)
    });*/
    //#chartdiv > div > div > div.amcharts-panels-div > div.amChartsPanel.amcharts-stock-panel-div.amcharts-stock-panel-div-stockPanel2 > div > div > svg > g:nth-child(13) > g > circle:nth-child(2)
    //document.querySelector("#chartdiv > div > div > div.amcharts-panels-div > div.amChartsPanel.amcharts-stock-panel-div.amcharts-stock-panel-div-stockPanel2 > div > div > svg > g:nth-child(13) > g > circle:nth-child(2)")
}).catch((msErr) => { console.log("❌ MORNINGSTAR_ERROR: " + msErr + " - '" + "AAPL" + "' " + msErr + " ❌") });

