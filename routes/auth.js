var express             = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    bodyParser          = require("body-parser"),
    async               = require('async'),
    crypto              = require('crypto'),
    nodemailer          = require("nodemailer");

var User    = require("../models/users");

router.use(bodyParser.urlencoded({extended: true}));


// Login page
router.get("/login", function(req, res){
    res.render("./auth/login");
});

// Login action
router.post("/login",
    passport.authenticate("local", {successRedirect: "/home",
                                    failureRedirect: "/login",
                                    successFlash: "Welcome",
                                    failureFlash: true}) 
);

// Registration page
router.get("/register", function(req, res){
   res.render("./auth/register"); 
});

// Register user
router.post("/register", function(req, res) {
    
    var adminEmails = ["ryanshores@us.matdan.com"];
    
    async.waterfall([
        // get admin emails
        function(done){
            User.find({'group': req.body.group, isAdmin: true}, function(err, foundAdmins){
                if(err) {
                    console.log("error finding admin emails");
                } else {
                    if( foundAdmins.length > 0 ) {
                        adminEmails = [];
                        foundAdmins.forEach(function(admin){
                            adminEmails.push(admin.email);
                        });
                    }
                }
                done(null, adminEmails);
            });
        },
        // setup mailer
        function(adminEmails, done){
            var transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'matdantester@gmail.com',
                    pass: 'stormtracker'
                }
            });
            var mailOptions = {
                from: '"Automated Message"', // sender address
                to: adminEmails, // list of receivers
                subject: 'New User: ' + req.body.name, // Subject line
                text: 'Name: ' + req.body.name + ", email: " + req.body.email + ', Company: ' + req.body.group // plain text body
            }; 
            done(null, transport, mailOptions);
        },
        // register new user
        function(transport, mailOptions, done){
            var newUser = new User({email: req.body.email, name: req.body.name, group: req.body.group});
            User.register(newUser, req.body.password, function(err, user){
                if( err ){
                    console.log(err);
                    var result = {
                        type: 'error',
                        value: err.message,
                        destination: '/home'
                    };
                    done(true, result);
                } else {
                    transport.sendMail(mailOptions, function(err, info){
                        if(err){
                            console.log("There was an error sending the email: " + err);
                        } else {
                            console.log("The new user email was sent");
                        }
                    });
                    var result = {
                        type: 'success',
                        value: 'Registration successful. Please Login.',
                        destination: '/login'
                    };
                    done(null, result, 'done');
                }
            });            
        }
        ], function(err, result) {
        if ( err ) {
            req.flash( result.type, result.value );
            res.redirect( result.destination );
        } else {
            req.flash( result.type, result.value );
            res.redirect( result.destination );
        }
    });
});

// Logout route
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Logged Out");
   res.redirect("/home");
});

// Forgot password GET
router.get('/forgot', function(req, res) {
  res.render('./auth/forgot', {
    user: req.user
  });
});

// Forgot password POST - /forgot
router.post('/forgot', function(req, res) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                if( err ) {
                    var result = {
                      type: 'error',
                      value: err.message,
                      destination: '/forgot'
                    };
                    done(true, result);
                } else {
                    var token = buf.toString('hex');
                    done(null, token);
                }
          });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, foundUser) {
                if ( err ) {
                    var result = {
                        type: 'error',
                        value: err.message,
                        destination: '/forgot'
                    };  
                    done(true, result);
                } else if (!foundUser) {
                    var result = {
                        type: 'warning',
                        value: 'An account with that email does not exist',
                        destination: '/forgot'
                    };
                    done(true, result);
                } else {
                    foundUser.resetPasswordToken = token;
                    foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            
                    foundUser.save(function(err) {
                        if( err ) {
                            var result = {
                                type: 'error',
                                value: err.message,
                                destination: '/forgot'
                            };
                            done(true, result);
                        } else {
                            done(null, token, foundUser);
                        }
                    });    
                }
            });
        },
        function(token, foundUser, done) {
            var transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'matdantester@gmail.com',
                    pass: 'stormtracker'
                }
            });
            var mailOptions = {
                to: foundUser.email,
                from: 'StormTracker',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transport.sendMail(mailOptions, function(err) {
                if( err ) {
                    var result = {
                        type: 'error',
                        value: err.message,
                        destination: '/home'
                    };
                    done(true, result);
                } else {
                    var result = {
                            type: 'success',
                            value: 'An e-mail has been sent to ' + foundUser.email + ' with further instructions.',
                            destination: '/home'
                        };
                    done(null, result, 'done');    
                }
            });
        }
    ], function(err, result) {
        if (err) {
            req.flash(result.type, result.value);
            res.redirect(result.destination);
        } else {
            req.flash(result.type, result.value);
            res.redirect(result.destination);
        }
    });
});

// Reset GET - /reset
router.get('/reset/:token', function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }, function(err, foundUser){
        if( err ) {
            req.flash('error', err.message);
            res.redirect('/forgot');
        } else if ( !foundUser ) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            res.redirect('/forgot');
        } else {
            res.render( './auth/reset', { token: req.params.token } ); 
        }
        
    });
});

router.post('/reset/:token', function(req, res, next) {
    var result = {};
    async.waterfall([
        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            }, function(err, foundUser) {
                if( err ){
                    result = {
                        type: 'err',
                        value: err.message,
                        destination: '/forgot'
                    };
                    done(true, result);
                } else if (!foundUser) {
                    result = {
                        type: "warning",
                        value: 'Password reset token is invalid or has expired.',
                        destination: '/forgot'
                    };
                    done(true, result);
                } else {
                    foundUser.resetPasswordToken = undefined;
                    foundUser.resetPasswordExpires = undefined;
            
                    foundUser.setPassword(req.body.password, function(){
                        foundUser.save(function(err){
                            if( err ){
                                result = {
                                    type: 'error',
                                    value: err.message,
                                    destination: '/forgot'
                                };
                                done(true, result);
                            } else {
                                done(null, foundUser);
                            }
                        });
                    });    
                }
            });
        },
        function(foundUser, done) {
            var transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'matdantester@gmail.com',
                    pass: 'stormtracker'
                }
            });
            var mailOptions = {
                to: foundUser.email,
                from: 'passwordreset',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + foundUser.email + ' has just been changed.\n'
            };
            transport.sendMail(mailOptions, function(err) {
                if( err ) {
                    // If we are here then the users password was updated but the email failed to send
                    result = {
                        type: 'warning',
                        value: 'Your password has been reset, but we were unable to email you a notification.',
                        destination: '/home'
                    };
                    done(null, result);
                } else {
                    // Password updated and email sent
                    result = {
                        type: 'success',
                        value: 'Success! Your password has been changed.',
                        destination: '/home'
                    };
                    done(null, result, 'done');
                }
            });
        }
    ], function(err) {
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