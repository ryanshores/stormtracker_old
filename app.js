var express         = require('express'),
    app             = express(),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local").Strategy,
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash");

require("dotenv").config({path: './vars.env'});

// requires the model with Passport-Local Mongoose plugged in
var User    = require("./models/users"),
    Sites   = require("./models/sites"),
    NewSites= require("./models/newsites");

// Require the route files
var indexRoutes     =   require("./routes/index"),
    authRoutes      =   require("./routes/auth"),
    siteRoutes      =   require("./routes/sites"),
    userRoutes      =   require("./routes/users"),
    weatherRoutes   =   require("./routes/weather"),
    newSiteRoutes   =   require("./routes/newsites");
    
// Email functions
var emailer =  require('./emails/emailer.js');

var email = {
    toEmail: [
        'ryan.shores@me.com',
        'ryanshores@us.matdan.com'
        ],
    toSubject: "Hurricane Bri",
};
// emailer.sendNewActivity(email.toEmail, email.toSubject);
    

// App setup
// ============================================
app.set("view engine", "ejs");  // allows the use of files without adding the .ejs filetype explicitly
// app.use(express.static("public")); //redundant. Can probably take out
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); //serves the public folder as a public folder for use in app
app.use(methodOverride("_method")); // allows the use of post and delete in url verbs

// Mongoose setup
// ============================================
mongoose.connect(process.env.MLAB_DB);
mongoose.Promise = global.Promise;

// Passport Setup
// ============================================
app.use(require("express-session")({
    secret: "anything that we want",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Flash Setup
// ============================================
app.use(flash());
// Passes data to all sites 
app.use(function (req, res, next) {
    // flash a message 
    res.locals.warning = req.flash("warning");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    res.locals.path = req.path;
    res.locals.wunderURL = "https://api.wunderground.com/api/5673c7f196ec2e7a/";
    next();
});


// Use the routes from the route files
app.use(indexRoutes);
app.use(authRoutes);
app.use('/sites', siteRoutes);
app.use('/users', userRoutes);
app.use('/weather', weatherRoutes);
app.use('/newsites', newSiteRoutes);


// START THE SERVER
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Serving website");
});

