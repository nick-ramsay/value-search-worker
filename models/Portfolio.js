const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PortfolioSchema = new Schema({
    account_id: {type: String},
    portfolio: {type: Array},
    labels: {type: Array}
})

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

module.exports = Portfolio;