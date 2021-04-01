import axios from "axios";

const apiURL = process.env.NODE_ENV === 'production' ? '' : '//localhost:3001'

export default {
    scrapeQuoteData: (symbol) => {
        console.log(symbol);
        return axios({ method: "post", url: apiURL + "/api/searching-finviz/scrape-quote-data", data: { symbol: symbol } });
    }
};