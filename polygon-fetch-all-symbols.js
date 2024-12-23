const { restClient } = require('@polygon.io/client-js');
require('dotenv').config()
const rest = restClient(process.env.POLYGON_API_KEY);

let allSymbolsFetched = false;
let queryBody = { market: "stocks", limit: 1000 }

// https://polygon.io/docs/stocks/get_v3_reference_tickers
do {
    console.log("Called do...")
    console.log(queryBody);
    rest.reference.tickers(queryBody).then((data) => {
        console.log(data);
        data.next_url !== undefined ? queryBody.next_url = data.next_url : allSymbolsFetched = true;

    }).catch(e => {
        console.error('An error happened:', e);
    });
}
while (allSymbolsFetched === false) 