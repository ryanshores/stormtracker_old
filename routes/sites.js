var express     = require("express"),
    router      = express.Router(),
    middleware  = require("../middleware/middleware.js"),
    async       = require("async"),
    fs          = require("fs");
    
var Sites    = require("../models/sites");

const wunderAPI = 'https://api.wunderground.com/api/' + process.env.WUNDERKEY;
const stormsURL = `${wunderAPI}/currenthurricane/view.json`;

//============================================================================//
//                                  CREATE                                    //

// PreNew
router.get("/select", function(req, res) {
    res.render("./sites/prenew");
});

// GET - /sites/new
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, function(req, res){
   res.render("./sites/new"); 
});
// POST - /sites/new - Sites.create()
router.post("/new", middleware.isLoggedIn, middleware.isAdmin, function(req, res){
    var newSite = new Sites({
        geometry: {coordinates: [req.body.lng, req.body.lat]},
        properties: {
            name: req.body.name,
            type: req.body.type,
            group: req.user.group,
            airGap: req.body.airGap,
            areaCode: req.body.areaCode,
            blockNumber: req.body.blockNumber,
            field: req.body.field,
            waterDepth: req.body.waterDepth,
    		workingInt: req.body.workingInt,
    		pd: req.body.pd,
    		rod: req.body.rod,
    		sl: req.body.sl,
    		oee: req.body.oee,
    		lopi: req.body.lopi,
    		windstormCSL: req.body.windstormCSL,
    		windstormRet: req.body.windstormRet
        }
    });
    Sites.create(newSite, function(err, newSite){
        if(err){
            console.log(err);
        } else {
            res.redirect("/sites");
        }
    });
});

//============================================================================//
//                                  READ                                      //
// GET - Index - /sites - get - Sites.find()
router.get("/", middleware.isLoggedIn, middleware.isActive, function(req, res) {
    Sites.find({'properties.group': req.user.group}).sort([['properties.type', 1], ['properties.areaCode', 1], ['properties.blockNumber', 1], ['properties.name', 1]]).exec(function(err, foundSites) {
        if(err) {
            req.flash("warning", "Could not find and sort sites");
            res.redirect("/home");
        } else {
            res.render("./sites/index", {sites: foundSites});
        }
    });
});

// GET - Filter Sites
router.post("/filter", function(req, res){
    Sites.find({ 'properties.areaCode': req.body.filter}).sort([['properties.type', 1]]).exec(function(err, foundSites) {
        if(err) {
            req.flash("warning", "Could not find and sort sites");
            res.redirect("/home");
        } else {
            console.log(foundSites);
            res.render("./sites/index", {sites: foundSites});
        }
    });
});

//============================================================================//
//                                  UPDATE                                    //
// GET - /sites/:id/edit - Sites.findByid()
router.get("/:id/edit", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    Sites.findById(req.params.id, function(err, foundSite){
        if(err){
            console.log(err);
            res.redirect("/sites");
        } else {
            if( foundSite.properties.group == req.user.group ) {
                res.render("./sites/edit", {site: foundSite});
            } else {
                req.flash("warning", "You are attempting to edit a site your group does not own.");
                res.redirect("/home");
            }
        }
    });
});
// PUT - /sites/:id - Sites.findByIdAndUpdate()
router.put("/:id", middleware.isLoggedIn, middleware.isAdmin, function(req, res){
    var updatedSite = {
        geometry: {coordinates: [req.body.lng, req.body.lat]},
        properties: {
            name: req.body.name,
            type: req.body.type,
            group: req.user.group,
            airGap: req.body.airGap,
            areaCode: req.body.areaCode,
            blockNumber: req.body.blockNumber,
            field: req.body.field,
            waterDepth: req.body.waterDepth,
    		workingInt: req.body.workingInt,
    		pd: req.body.pd,
    		rod: req.body.rod,
    		sl: req.body.sl,
    		oee: req.body.oee,
    		lopi: req.body.lopi,
    		windstormCSL: req.body.windstormCSL,
    		windstormRet: req.body.windstormRet
        }
    };
    
    //Check group ownership
    Sites.findById(req.params.id, function(err, foundSite){
        if(err){
            req.flash("error", "Something went wrong, try again");
            res.redirect("/sites");
        } else {
            if( foundSite.properties.group != req.user.group ) {
                req.flash("warning", "Your group does not own that site");
                res.redirect("/home");
            }
        }
    });
    
    
    // Update site
    Sites.findByIdAndUpdate(req.params.id, updatedSite, function(err, updatedSite){
        if(err){
            req.flash("error", "Something went wrong, try again");
            res.redirect("/home");
        } else {
            req.flash("success", "Sucessfully updated the site");
            res.redirect("/sites");
        }
    });
});

//============================================================================//
//                                  DESTROY                                   //
// DELETE - /sites/:id - Sites.findByIdAndRemove()
router.delete("/:id", middleware.isLoggedIn, middleware.isAdmin, function(req, res){
    
    async.waterfall([
        function(done){
            // check ownership before deleting
            Sites.findById(req.params.id, function(err, foundSite){
                if( err ){
                    var result = {
                        'type': 'error',
                        'value': err,
                        'destination': '/home'
                    };
                    done(true, result);
                } else {
                    if( foundSite.properties.group != req.user.group ) {
                        var result = {
                            'type': 'warning',
                            'value': "You do not own that asset",
                            'destination': '/home'
                        };
                        done(true, result);
                    } else {
                        done(null);
                    }
                }
            });
        }, 
        function(done){
            // remove the asset
            Sites.findByIdAndRemove(req.params.id, function(err){
                if( err ){
                    var result = {
                        'type': 'error',
                        'value': err,
                        'destination': '/home'
                    }
                    done(true, result);
                } else {
                    var result = {
                        'type': 'success',
                        'value': "The asset was removed.",
                        'destination': '/sites'
                    };
                    done(null, result, 'done');
                }
            });
        }], 
    function(err, result){
        if ( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.destination );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.destination );
        }
    });
});

module.exports = router;