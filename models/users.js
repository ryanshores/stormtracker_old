var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

// SCHEMA SETUP
var userSchema = new mongoose.Schema({
    group: {type: String, required: true},
    name: {type: String, required: true},
    isAdmin: {type: Boolean, default: false},
    isActive: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportlocalmongoose, {usernameField: 'email'});

module.exports = mongoose.model("User", userSchema);