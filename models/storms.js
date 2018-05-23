var mongoose = require("mongoose");

// SCHEMA SETUP - storms colleced from wunderground api
var autostormSchema = new mongoose.Schema({
    name: String,
    number: String,
    category: Number
});

module.exports = mongoose.model("AutoStorm", autostormSchema);