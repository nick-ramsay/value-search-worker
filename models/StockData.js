const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockDataSchema = new Schema({
    symbol: { type: String },
    fundamentals: { type: Object },
    lastUpdated: { type: Date }
})

const StockData = mongoose.model("StockData", StockDataSchema);

module.exports = StockData;