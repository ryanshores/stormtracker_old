var express     = require("express"),
    router      = express.Router(),
    request     = require("request"),
    bodyParser  = require("body-parser"),
    async       = require("async"),
    rss         = require("rss-to-json"),
    schedule    = require('node-schedule');
    
var Sites   = require("../models/sites");
var Storms  = require('../models/storms');

router.use(bodyParser.urlencoded({extended: true}));

const wunderAPI = 'https://api.wunderground.com/api/5673c7f196ec2e7a';
let forecastURL = `${wunderAPI}/forecast/q/.json`;
let stormsURL = `${wunderAPI}/currenthurricane/view.json`;

var emailer =  require('../emails/emailer.js');

// schedule.scheduleJob('10 * * * * *', function(){
//     console.log('Starting Job');
//     getNewStorms(function(result){
//         console.log(result);
//     });
// });

getNewStorms(function(result){
        console.log('Result: ' + result);
    });

function getNewStorms(){
    let storms = [];
    async.waterfall([
        // Get hurricanes
        function(done){
            request(stormsURL, function(err, responce, body){
                if( err ){
                    done( true, storms );
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
                        // Add to array
                        storms.push(stormObj);
                    });
                    done( null, storms );
                }
            });
        },
        // Label the duplicates
        function(storms, done){
            let activeStorms = [];
            storms.forEach(function( storm ){
                storm.isDup = false;
                activeStorms.forEach(function( activeStorm ){
                    if( activeStorm == storm.name ) {
                        storm.isDup = true;
                    }
                });
                activeStorms.push( storm.name );
            });
            done(null, storms);
        },
        // Remove the duplicates
        function(storms, done) {
            storms.forEach(function(storm, i){
               if(storm.isDup){
                   delete storms[i];
               }
            });
            done(null, storms);
        },
        // Check if storm is in db already if not add
        function(storms, done){
            storms.forEach(function(storm){
                // Storms.count({number: storm.number}, function(err, result){
                //     if( err ) {console.log(err)}
                //     else {
                //         if( result == 0 ) {
                //             Storms.create(storm, function(err, newStorm){
                //                 if(err){console.log(err);}
                //                 else { newStorms.push(newStorm) }
                //             });
                //         } else {
                            
                //         }
                //     }
                // });
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
                                emailer.sendNewActivity('ryanshores@us.matdan.com', newStorm.name + " Cat. " + newStorm.category);
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
                            emailer.upgradeActivity('ryanshores@us.matdan.com', doc.name + " Cat. " + doc.category);
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
    function(err, result){
        if( err ) { }
        else { }
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
    let result = {};
    
    async.waterfall([
        // get the sites
        function(done){
            // check if a user is logged in
            if(req.user && req.user.isActive) {
                Sites.find({'properties.group': req.user.group}, function(err, foundSites){
                    if(err) {
                        console.log(err.message);
                        done( null, sites );
                    } else {
                        sites = foundSites;
                        done( null, sites );
                    }
                });
            } else {
                done( null, sites );
            }
        }, 
        // get the storms
        function( sites, done ){
            request(stormsURL, function(err, responce, body){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: null
                    };
                    done( true, sites, storms, result );
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
                        // Add to array
                        storms.push(stormObj);
                    });
                    result = {
                        type: 'success',
                        value: 'Successfully loaded the active storms',
                        dest: null
                    };
                    done( null, sites, storms, result, 'done');
                }
            });
        }
    ],
    function( err, sites, storms, result ){ 
        if (err){
            req.flash( result.type, result.value );
            res.render("./weather/tropical", { storms: storms, sites: sites });
        } else {
            res.render("./weather/tropical", { storms: storms, sites: sites });
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


// Unused routes
// Loads PDF viewer
router.get("/advisory", function(req, res) {
    res.render("./weather/advisory");
});
// Loads example data (Matdan sites, archived hurricane track, cone, and wind data.
// Also loads hurricane Ryan from the examaple JSON file
// Play around with getting the cone as geojson, then added value to assets within cone
//      EX: if( geowithin cone -> site.danger = true )
router.get("/tropicalexample", function(req, res){
    
    // init empty arr for storms
    let storms = [];
    let sites = [];
    
    // just here to pass in test json
    let json_parsed = JSON.parse(JSON.stringify(obj));
    
    async.waterfall([
        // get the sites
        function(done){
            Sites.find({'properties.group': 'MatDan'}, function(err, foundSites){
                if(err) {
                    done(err, sites);
                } else {
                    sites = foundSites;
                    done(null, sites);
                }
            });
        },
        // get the storms
        function(sites, done){
            // Does all the work - parses the data and gets what I want out to give to the page
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
                
                // Storm objects
                var stormObj = {
                    'name': storm['stormInfo']['stormName_Nice'],
                    'lat': storm['Current']['lat'],
                    'lng': storm['Current']['lon'],
                    'category': storm['Current']['SaffirSimpsonCategory'],
                    'fspeed': storm['Current']['Fspeed']['Mph'],
                    'direction': storm['Current']['Movement']['Degrees'],
                    'Forecast': forecasts
                };
                storms.push(stormObj);
            });
            done(null, sites, storms, 'done');
        }],
        function(err){ 
            if (err){
                req.flash("error", err);
                res.redirect("/home");
            } else {
                res.render("./weather/tropical_example", { storms: storms, sites: sites });
            } 
        });
});

// Test Routes
// Loads a rss feed
router.get('/rss', function(req, res){
    let feed = '';
    rss.load('https://www.nhc.noaa.gov/rss_examples/gis-at-20130605.xml', function(err, json){
        if (err) {
            console.log(err);
        } else {
            res.render('./weather/rss', {feed: json});
        }
    });
});
router.get('/test', function(req, res){
    res.render("./weather/test");
});



module.exports = router;