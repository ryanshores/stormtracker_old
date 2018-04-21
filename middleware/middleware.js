var User    = require("../models/users"),
    Site    = require("../models/sites");
    
var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash("warning", "You need to log in first");
        res.redirect("/login");
    }
};

middlewareObj.isAdmin = function isAdmin(req, res, next){
    if(req.user.isAdmin){
        return next();
    } else {
        req.flash("warning", "You need to be admin to do that");
        res.redirect("/home");
    }
};

middlewareObj.isActive = function isActive(req, res, next){
    if(req.user.isActive){
        return next();
    } else {
        req.flash("warning", "Your account is not active yet. Contact your admin.");
        res.redirect("/home");
    }
};

middlewareObj.checkGroup = function checkGroup(req, res, next){
    Site.findById(req.params.id, function(err, foundSite){ //try and find site
        if(err){    // if err go back
            req.false("warning", "Site not found");
            res.redirect("back");
        } else { // if found site continue
            // is user in group
            if(foundSite.group.equals(req.user.group)) { // if in group go next
                next();     
            } else { // if not in group go back
                req.flash("warning", "You aren't in that group. Sorry.")
                res.redirect("back");
            }
        }
    });
};

middlewareObj.getGeoJSON = function getGeoJSON(sites){
    const locs = [];
    sites.forEach(function(site){
       locs.push(site.location); 
    });
    return locs;
}

module.exports = middlewareObj;