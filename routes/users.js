let express             = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    nodemailer          = require("nodemailer"),
    bodyParser          = require("body-parser"),
    async               = require('async'),
    middleware          = require("../middleware/middleware.js");
    
let Users    = require("../models/users");

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'matdantester@gmail.com',
        pass: 'stormtracker'
    }
});


router.use(bodyParser.urlencoded({extended: true}));

// User Index page - /users/
router.get("/", middleware.isLoggedIn, middleware.isAdmin, function(req, res){
    
    // Show admins who are logged in users in thier group
    Users.find({'group': req.user.group}, function(err, foundUsers){
        if(err){
            req.flash("error", "I am terribly sorry, but I could not find any users!");
            res.redirect("/home");
        } else {
            res.render("./users/index", {users: foundUsers});
        }
    });
});

// REMOVE FROM GROUP - isActive: false
router.post("/:id/makeinactive", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    
    let result = {};
    
    async.waterfall([
        function(done){
            Users.findById(req.params.id, function(err, foundUser){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    if( foundUser.group != req.user.group ) {
                        result = {
                            type: 'warning',
                            value: 'That user is not apart of your company',
                            dest: '/home'
                        };
                        done( true , result );
                    } else {
                        done( null );
                    }
                }
            });
        }, 
        function(done){
            Users.findByIdAndUpdate(req.params.id, { isActive: false, isAdmin: false }, function(err, updatedUser) {
                if( err ) {
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    result = {
                        type: 'success',
                        value: 'Set user status to inactive',
                        dest: '/users'
                    };
                    done( null, result, 'done' );
                }
            });  
        }], 
    function( err, result ){
        if( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        }
    });
    
});

// REMOVE FROM GROUP - isactive: false, group: ""
router.post("/:id/removefromgroup", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    
    let result = {};
    
    async.waterfall([
        function(done){
            Users.findById(req.params.id, function(err, foundUser){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    if( foundUser.group != req.user.group ) {
                        result = {
                            type: 'warning',
                            value: 'That user is not apart of your company',
                            dest: '/home'
                        };
                        done( true , result );
                    } else {
                        done( null );
                    }
                }
            });
        },
        function(done){
            Users.findByIdAndUpdate(req.params.id, { group: "", isActive: false, isAdmin: false }, function(err, updatedUser) {
                if( err ) {
                   result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                   result = {
                        type: 'success',
                        value: 'Removed user from company',
                        dest: '/users'
                    };
                    done( null, result, 'done' );
               }
           });
        }
        ], 
    function( err, result ) {
        if( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        }
    });
});

// ADD TO GROUP
router.post("/:id/addtogroup", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    
    let result = {};
    
    async.waterfall([
        function(done){
            Users.findById(req.params.id, function(err, foundUser){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    if( foundUser.group != req.user.group ) {
                        result = {
                            type: 'warning',
                            value: 'That user is not apart of your company',
                            dest: '/home'
                        };
                        done( true , result );
                    } else {
                        done( null );
                    }
                }
            });
        },
        function(done){
            Users.findByIdAndUpdate(req.params.id, { isActive: true, isAdmin: false }, function(err, updatedUser) {
                if( err ) {
                   result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                   result = {
                        type: 'success',
                        value: 'Set users status to active',
                        dest: '/users'
                    };
                    done( null, result, 'done' );
               }
           });
        }
        ], 
    function( err, result ) {
        if( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        }
    });
});

// isAdmin routes - true
router.post("/:id/makeadmin", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    
    let result = {};
    
    async.waterfall([
        function(done){
            Users.findById(req.params.id, function(err, foundUser){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    if( foundUser.group != req.user.group ) {
                        result = {
                            type: 'warning',
                            value: 'That user is not apart of your company',
                            dest: '/home'
                        };
                        done( true , result );
                    } else {
                        done( null );
                    }
                }
            });
        },
        function(done){
            Users.findByIdAndUpdate(req.params.id, { isAdmin: true, isActive: true }, function( err, updatedUser ) {
                if( err ) {
                   result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                   result = {
                        type: 'success',
                        value: "Made " + updatedUser.name + " an admin.",
                        dest: '/users'
                    };
                    done( null, result, 'done' );
               }
           });
        }
        ], 
    function( err, result ) {
        if( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        }
    });
});

// isAdmin - false
router.post("/:id/makenotadmin", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    
    let result = {};
    
    async.waterfall([
        function(done){
            Users.findById(req.params.id, function(err, foundUser){
                if( err ){
                    result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                    if( foundUser.group != req.user.group ) {
                        result = {
                            type: 'warning',
                            value: 'That user is not apart of your company',
                            dest: '/home'
                        };
                        done( true , result );
                    } else {
                        done( null );
                    }
                }
            });
        },
        function(done){
            Users.findByIdAndUpdate(req.params.id, { isAdmin: false, isActive: true }, function( err, updatedUser ) {
                if( err ) {
                   result = {
                        type: 'error',
                        value: err.message,
                        dest: '/users'
                    };
                    done( true, result );
                } else {
                   result = {
                        type: 'success',
                        value: "Revoked admin access for " + updatedUser.name,
                        dest: '/users'
                    };
                    done( null, result, 'done' );
               }
           });
        }
        ], 
    function( err, result ) {
        if( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.dest );
        }
    });
});


// Users setting page - users/:id/ - GET
router.get("/:id", middleware.isLoggedIn, function(req, res){
    
    // Stop users from viewing others info
    if( req.user._id == req.params.id ){
        Users.findById(req.params.id, function(err, foundUser){
            if(err){
                req.flash("error", err);
                res.redirect("/home");
            } 
            res.render("./users/usersettings", {user: foundUser});
        });
    } else {
        req.flash("warning", "You can't view other users info!");
        res.redirect("/home");
    }
    
    
    
});

// // UPDATE UPDATED - POSTS
// UPDATE NAME
router.post("/:id/name", middleware.isLoggedIn, function(req, res){
    
    // Stop users from changing each others info
    if( req.user._id == req.params.id ){
        Users.findByIdAndUpdate(req.params.id, {name: req.body.name}, function(err, updatedUser) {
            if(err){
                req.flash("error", err);
                res.redirect("/home");
            } else {
                req.flash("success", "New name saved.");
                res.redirect("/home");
            }
        });    
    } else {
        req.flash("warning", "You can't change other user's name!");
        res.redirect("/home");
    }
    
});

// UPDATE EMAIL - will need to remake profile and delete old profile possibly
// router.post("/:id/email", middleware.isLoggedIn, function(req, res) {
//     res.send("Will eventually change your email.");
// })

// UPDATE GROUP - working
router.post("/:id/group", middleware.isLoggedIn, function(req, res){
    
    // Setup default admin email
    let adminEmails = ["matdantester@gmail.com"];
    let result = {};
    
    // Stop users from changing each others info
    if( req.user._id == req.params.id ){
        async.waterfall([
            function(done){
                Users.find({'group': req.body.group, isAdmin: true}, function(err, foundAdmins){
                    if( err ) {
                        // Error finding admin emails, no need to break from waterfall
                        console.log("error finding admin emails");
                        done( null, adminEmails );
                    } else {
                        if( foundAdmins.length > 0 ) {
                            adminEmails = [];
                            foundAdmins.forEach(function(admin){
                                adminEmails.push(admin.email);
                            });
                            done( null, adminEmails );
                        } else {
                            done( null, adminEmails );
                        }
                    }
                });
            },
            // update users profile and send email
            function( adminEmails, done ){
                var updatedUser = {group: req.body.group, isActive: false, isAdmin: false}; 
                Users.findByIdAndUpdate(req.params.id, updatedUser, function(err, updatedUser){
                    if( err ){
                        result = {
                            type: 'error',
                            value: err.message,
                            dest: '/home'
                        };
                        done( true, result );
                    } else {
                        var mailOptions = {
                            from: 'StormTracker', // sender address
                            to: adminEmails, // list of receivers
                            subject: 'New User: ' + updatedUser.name, // Subject line
                            text: 'Name: ' + updatedUser.name + ", email: " + updatedUser.email + ', group: ' + updatedUser.group // plain text body
                        }; 
                        transport.sendMail(mailOptions, function(err, info){
                            if(err){
                                result = {
                                    type: 'warning',
                                    value: 'There was an error notifying the admin of your request to join the company account. Please notify them to gain access.',
                                    dest: '/home'
                                };
                                done( null, result, 'done');
                                console.log("There was an error sending the admin notification email: " + err.message);
                            } else {
                                result = {
                                    type: 'success',
                                    value: 'Your company has sucessfully been updated!',
                                    dest: '/home'
                                };
                                done( null, result, 'done');
                            }
                        });  
                    }
                });          
            }
            ],
        function(err){
            if( err ) {
                req.flash( result.type, result.value );
                res.redirect( result.dest );
            } else {
                req.flash( result.type, result.value );
                res.redirect( result.dest );
            }
        });
    } else {
        req.flash("warning", "You can't change other user's group!");
        res.redirect("/home");
    }
});

// UPDATE PASSWORD need to make more secure not working
router.post("/:id/password", middleware.isLoggedIn, function(req, res){
    
    // Stop users from changing each other's password
    if( req.user._id == req.params.id ){
        // check passwords match
        if(req.body.newPassword === req.body.newPasswordAgain) {
            Users.findById(req.params.id, function(err, foundUser){
                if(err){
                    req.flash("err", err);
                    res.redirect("/home");
                } else {
                    foundUser.setPassword(req.body.newPassword, function(){
                        foundUser.save();
                        req.flash("success", "Updated password");
                        res.redirect("/home");
                    });
                }
            });
        } else {
            req.flash("warning", "Your new passwords did not match. Try again.");
            res.redirect("/home");
        }    
    } else {
        req.flash("warning", "You can't change other user's password!");
        res.redirect("/home");
    }
    
});

// DELETE PROFILE - POST
router.post("/:id/delete", middleware.isLoggedIn, function(req, res) {
    
    // Check to stop users from deleting each other
    if( req.user._id == req.params.id){
        Users.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.flash("error", "I am terribly sorry. I was unable to delete your account.");
                res.redirect("/home");
            } else {
                req.flash("success", "Your account has been deleted. You will be missed.");
                res.redirect("/home");
            }
        });    
    } else {
        req.flash("warning", "You can't delete other people's profile...");
        res.redirect("/home");
    }
    
});




module.exports = router;