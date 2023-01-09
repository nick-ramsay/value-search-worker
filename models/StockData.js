const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockDataSchema = new Schema({
    symbol: { type: String },
    symbolData: { type: Object },
    quote: { type: Object },
    fundamentals: { type: Object },
    iexStats: { type: Object },
    quoteLastUpdated: { type: Date },
    fundamentalsLastUpdated: { type: Date },
    iexStatsLastUpdated: { type: Date },
    iexStatusLastUpdated: { type: Date },
    valueSearchScore: {type: Object},
    valueSearchScoreLastUpdated: {type: Date}
})

const StockData = mongoose.model("StockData", StockDataSchema);

module.exports = StockData;