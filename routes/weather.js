var express     = require("express"),
    router      = express.Router(),
    request     = require("request"),
    bodyParser  = require("body-parser"),
    async       = require("async"),
    rss         = require("rss-to-json"),
    schedule    = require('node-schedule');
    
var Sites   = require("../models/sites");
var Storms  = require('../models/storms');
var adminStorms = require("../models/adminStorms");
var Cards = require("../models/cards");
var newSites    = require("../models/newsites");

var pointsInCones = require("../middleware/pointsInCones");
var pointsInCones2 = require("../middleware/pointsInCones2");

router.use(bodyParser.urlencoded({extended: true}));

const wunderAPI = 'https://api.wunderground.com/api/' + process.env.WUNDERKEY;
let forecastURL = `${wunderAPI}/forecast/q/.json`;
let stormsURL = `${wunderAPI}/currenthurricane/view.json`;

var emailer =  require('../emails/emailer.js');

var taskSchedule = new schedule.RecurrenceRule();

taskSchedule.hour = [0,6,12,18];
schedule.scheduleJob(taskSchedule, getNewStorms);

function getByValue(arr, query, value) {
    var newArr = [];
    for (var i = 0; i<arr.length; i++) {
        if(arr[i][query].indexOf(value) > -1){
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

function removeDuplicates(arr, key) {
    if (!(arr instanceof Array) || key && typeof key !== 'string') {
        return false;
    }

    if (key && typeof key === 'string') {
        return arr.filter(function (obj, index, arr) {
            return arr.map(function (mapObj) {
                return mapObj[key];
            }).indexOf(obj[key]) === index;
        });
    } else {
        return arr.filter(function (item, index, arr) {
            return arr.indexOf(item) == index;
        });
    }
}

function getNewStorms(){
    console.log("Checking for new storms");
    let storms = [];
    async.waterfall([
        // Get hurricanes
        function(done){
            request(stormsURL, function(err, responce, body){
                console.log(body);
                if( err ){
                    done( true );
                } else {
                    // parse the request
                    let json_parsed = JSON.parse(body);
                    // retrieve the data that I want
                    json_parsed['currenthurricane'].forEach( function( storm ) {
                        // This is the object that goes into the array
                        var stormObj = {
                            name: storm['stormInfo']['stormName_Nice'],
                            number: storm['stormInfo']['stormNumber'],
                            category: storm['Current']['SaffirSimpsonCategory']
                        };
                        // Add to array if the storm is cat 0 and above
                        if( stormObj.category >= 0 ) {
                            storms.push(stormObj);
                        }
                        
                    });
                    done( null, storms );
                }
            });
        },
        // Remove Duplicates and Sort
        function(storms, done){
            var uniqueStorms = removeDuplicates(storms, 'number');
            var filteredStorms = getByValue(uniqueStorms, 'number', 'at');
            done(null, filteredStorms);
        },
        // Check if storm is in db already if not add
        function(storms, done){
            console.log(storms);
            storms.forEach(function(storm){
                Storms.findOne({number: storm.number}, function( err, doc ){
                    if( err ){
                        console.log(err);
                    }
                    if( doc == null) {
                        // The storm does not exist yet   
                        Storms.create(storm, function(err, newStorm){
                            if(err){console.log(err);}
                            else {
                                // Send the new activity email
                                console.log("New activity");
                                emailer.sendNewActivity(newStorm.name + " Cat. " + newStorm.category);
                            }
                        });
                    } else {
                        // The storm exists
                        // Check is the category has increased
                        if( doc.category < storm.category ) {
                            // The category has increased
                            // Send a category increase email and update
                            console.log('category increase');
                            doc.category = storm.category;
                            doc.save(function(err){
                                if(err){
                                    console.log(err);
                                }
                            });
                            emailer.upgradedActivity(doc.name + " Cat. " + doc.category);
                        } else {
                            // The storm is the same category
                            // Do nothing
                            console.log("Nothing has changed");
                        }
                    }
                });
            });
            done(null, 'done');
        }
        ], 
    function(err){
        if( err ){
            console.log( err );
        } else {
            console.log("Finished checking for new storms");
        }
    });
}


// Routes used by the site
// Loads satellite radar from SSEC
router.get("/satellite", function(req, res){
   res.render("./weather/radar"); 
});
// Loads the current storms
// Will color code assets in danger in the future also
router.get("/activity", function(req, res){
    
    // init empty arr for storms
    let storms = [];
    let sites = [];
    let stormtabs = [];
    let cones = [];
    let allSites = [];
    
    async.waterfall([
        // get the users sites
        function(done){
            // check if a user is logged in
            if(req.user && req.user.isActive) {
                Sites.find({'properties.group': req.user.group}, function(err, foundSites){
                    if(err) {
                        console.log(err.message);
                        done( null, sites );
                    } else {
                        sites = JSON.stringify(foundSites);
                        sites = JSON.parse(sites);
                        done( null, sites );
                    }
                });
            } else {
                done( null, sites );
            }
        }, 
        // get the storms for the tabs
        function( sites, done ){
            adminStorms.find({isActive: true}).populate("cards").exec(function( err, storms ){
                if( err ) { 
                    console.log(err);
                    done(null, sites, stormtabs);
                }
                else { 
                    stormtabs = storms;
                    done(null, sites, stormtabs);
                }
            });
        },
        // make cones and color code
        function(sites, stormtabs, callback){
            pointsInCones(sites, stormtabs, function(err, conesObj, points){
                if(err){
                    // handle error
                } else {
                    sites = points;
                    cones = conesObj;
                }
                callback(null, cones, sites, stormtabs);
            });
        },
        // get the storms
        function( cones, sites, stormtabs, done ){
            request(stormsURL, function(err, responce, body){
                if( err ){
                    done( err, sites, stormtabs, storms );
                } else {
                    // parse the request
                    let json_parsed = JSON.parse(body);
                    // retrieve the data that I want
                    json_parsed['currenthurricane'].forEach( function( storm ) {
                        // forecast objects
                        let forecasts = [];
                        storm['forecast'].forEach(function(forecast) {
                            var forecastObj = {
                                'hour': forecast['ForecastHour'],
                                'lat': forecast['lat'],
                                'lng': forecast['lon'],
                                'type': forecast['Category'],
                                'category': forecast['SaffirSimpsonCategory']
                            };
                            forecasts.push(forecastObj);
                        });
                        // This is the object that goes into the array
                        var stormObj = {
                            'name': storm['stormInfo']['stormName_Nice'],
                            'number': storm['stormInfo']['stormNumber'],
                            'lat': storm['Current']['lat'],
                            'lng': storm['Current']['lon'],
                            'category': storm['Current']['SaffirSimpsonCategory'],
                            'fspeed': storm['Current']['Fspeed']['Mph'],
                            'direction': storm['Current']['Movement']['Degrees'],
                            'wind': storm['Current']['WindSpeed']['Mph'],
                            'gusts': storm['Current']['WindGust']['Mph'],
                            'pressure': storm['Current']['Pressure']['Inches'],
                            'Forecast': forecasts
                        };
                        // Add to array if cat 0 and above
                        if( stormObj.category >= 0 ) {
                            storms.push(stormObj);
                        }
                    });
                    
                    done( null, cones, sites, stormtabs, storms);
                }
            });
        },
        // Remove Duplicates
        function( cones, sites, stormtabs, storms, done){
            var filteredStorms = removeDuplicates(storms, 'number');
            done(null, cones, sites, stormtabs, filteredStorms);
        },
        // get all the sites
        function( cones, sites, stormtabs, filteredStorms, callback){
            newSites.find({}, function(err, foundNewSites){
                if(err){
                    console.log(err);
                    callback(null, cones, sites, stormtabs, filteredStorms, allSites);
                } else {
                    foundNewSites.forEach(function(site, i){
                        if( i % 10 == 0 ){
                            var siteObj = {
                                name: site["Structure Name"],
                                coordinates: [ site["Longitude"], site["Latitude"] ]
                            };
                            siteObj.name = siteObj.name.replace(/"/g,"");
                            allSites.push(siteObj);    
                        }
                    });
                    callback(null, cones, sites, stormtabs, filteredStorms, allSites);
                }
            });
        },
        // coor code all points
        function(cones, sites, stormtabs, filteredStorms, allSites, callback){
            pointsInCones2(allSites, cones, function(err, points){
                if(err){
                    // handle error
                } else {
                    allSites = points;
                }
                callback(null, cones, sites, stormtabs, filteredStorms, allSites);
            });
        }
    ],
    function( err, cones, sites, stormtabs, filteredStorms, allSites ){ 
        if (err){
            req.flash( "error", err );
            res.render("./weather/tropical", { storms: filteredStorms, sites: sites, stormtabs: stormtabs, cones: cones, allSites: allSites });
        } else {
            res.render("./weather/tropical", { storms: filteredStorms, sites: sites, stormtabs: stormtabs, cones: cones, allSites: allSites });
        } 
    });
});
// Loads tabed page of different weather maps
router.get("/models", function(req, res) {
   res.render("./weather/models"); 
});
// Forecast
router.get("/current", function(req, res){
    res.render('./weather/current');
});
// Takes input location and returns forecast
router.post("/current", function(req, res){
    let forecast = [];
    let coords = req.body.coords;
    
    request(wunderAPI + '/forecast10day/q/' + coords + '.json', function(err, responce, body){
        if(err){
            req.flash("error", err);
            res.render("./weather/current");
        } else {
            let json_parsed = JSON.parse(body);
            if( json_parsed['forecast'] ) {
                // Do something if the forecast exists
                json_parsed['forecast']['simpleforecast']['forecastday'].forEach(function(day, i){
                    var forecastObj = {
                        'weekday': day['date']['weekday'],
                        'highT': day['high']['fahrenheit'],
                        'lowT': day['low']['fahrenheit'],
                        'condition': day['conditions'],
                        'icon': day['icon_url'],
                        'percentage': day['pop'],
                        'windSpeed': day['avewind']['mph'],
                        'windDirection': day['avewind']['dir'],
                        'gustSpeed': day['maxwind']['mph'],
                        'gustDirection': day['maxwind']['dir'],
                        'humidity': day['avehumidity']
                    };
                    forecast.push(forecastObj);
                });
                res.render( "./weather/current", { forecast: forecast, coords: coords } );
            } else {
              // Do something if the forecast does not exist
              res.render("./weather/current");
            }
        }
    });
});
// Outlook
router.get("/outlook", function(req, res) {
    res.render("./weather/outlook");
});


module.exports = router;