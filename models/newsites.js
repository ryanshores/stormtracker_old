var mongoose = require("mongoose");

// SCHEMA SETUP
var newSiteSchema = new mongoose.Schema({

    "Area Code": String,
    "Block Number": String,
    "Field": String,
    "Structure Name": String,
    "Structure Number": Number,
    "Bus Asc Name": String,
    "Complex Id Num": Number,
    "Install Date": Date,
    "Water Depth": Number,
    "Latitude": Number,
    "Longitude": Number
});

module.exports = mongoose.model("New Site", newSiteSchema, 'newsites');