const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PortfolioItemsSchema = new Schema({
    account_id: { type: String },
    symbol: {type: String},
    comments: {type: Array},
    labels: { type: Array },
    priceTarget: { type: Number },
    priceTargetEnabled: { type: Boolean },
    queuedForPurchase: {type: Boolean},
    sellTarget: {type: Number},
    sellTargetEnabled: {type: Boolean},
    status: {type: String}
})

const PortfolioItems = mongoose.model("PortfolioItems", PortfolioItemsSchema);

module.exports = PortfolioItems;