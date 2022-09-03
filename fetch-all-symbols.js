require('dotenv').config()
const axios = require("axios");
const { MongoClient, Db } = require("mongodb");

let IEX_TOKEN = process.env.IEX_API_KEY;

// Replace the uri string with your connection string.
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

axios.get("https://cloud.iexapis.com/beta/ref-data/symbols?&token=" + IEX_TOKEN)
    .then((res) => {

        console.log(res.data);

        /*for (let i = 0; i < res.data.length; i++) {
            console.log(res.data[i].name + " (" + res.data[i].symbol + ")");
        }*/

    })
    .catch((err) => {
        console.log("ERROR: " + err.response.status + " - " + err.response.statusText)
    });