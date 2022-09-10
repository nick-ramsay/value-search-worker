const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockDataSchema = new Schema({
    symbol: { type: String },
    quote: { type: Object },
    fundamentals: { type: Object },
    quoteLastUpdated: { type: Date },
    fundamentalsLastUpdated: { type: Date }
})

const StockData = mongoose.model("StockData", StockDataSchema);

module.exports = StockData;