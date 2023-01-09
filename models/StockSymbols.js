const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSymbolsSchema = new Schema({
    symbol: { type: String },
    data: { type: Object },
    lastUpdated: { type: Date },
    quoteLastUpdated: { type: Date },
    fundamentalsLastUpdated: { type: Date },
    iexStatusLastUpdated: { type: Date },
    iexStatsLastUpdated: { type: Date },
    valueSearchScoreLastUpdated: {type: Date}
})

const StockSymbols = mongoose.model("StockSymbols", StockSymbolsSchema);

module.exports = StockSymbols;