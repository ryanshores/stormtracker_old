var mongoose = require("mongoose");

// SCHEMA SETUP
var autostormSchema = new mongoose.Schema({
    name: String,
    number: String,
    category: Number
});

module.exports = mongoose.model("AutoStorm", autostormSchema);