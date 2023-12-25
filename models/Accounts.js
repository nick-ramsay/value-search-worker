const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountsSchema = new Schema({
    email: { type: String },
    phone: { type: Number},
    password: { type: String },
    firstname: {type: String},
    lastname: {type: String},
    sessionAccessToken: {type: String},
    passwordResetToken: {type: String},
    autoTasks: {type: Array}
})

const Accounts = mongoose.model("Accounts", AccountsSchema);

module.exports = Accounts;