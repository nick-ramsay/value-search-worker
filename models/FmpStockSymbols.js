const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FmpStockSymbolsSchema = new Schema({
    symbol: { type: String },
    data: { type: Object },
    lastUpdated: { type: Date },
    quoteLastUpdated: { type: Date },
    fundamentalsLastUpdated: { type: Date },
    iexStatusLastUpdated: { type: Date },
    iexStatsLastUpdated: { type: Date },
    valueSearchScoreLastUpdated: {type: Date}
})

const FmpStockSymbols = mongoose.model("FmpStockSymbols", FmpStockSymbolsSchema);

module.exports = FmpStockSymbols;