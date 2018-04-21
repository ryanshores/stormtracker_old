var express     = require("express");
var router      = express.Router();
var nodemailer  = require("nodemailer");


// Coverpage
router.get("/", function(req, res){
    res.render("coverpage");
});

// Test Home
router.get("/testhome", function(req, res) {
    res.render("testhome");
});

// Home
router.get("/home", function(req, res){
    res.render("home");
});

router.get('/credits', function(req, res) {
    res.render("credits");
});

// Contact
router.get("/contact", function(req, res){
   res.render("contact");
});

// Send contact email
router.post('/contact', function(req, res){
    
    var mailOptions, transport;
    
    transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'matdantester@gmail.com',
            pass: 'stormtracker'
        }
    });
    
    mailOptions = {
        replyTo: req.body.email,
        to: 'ryanshores@us.matdan.com', // list of receivers
        subject: 'Message from: ' + req.body.name, // Subject line
        text: req.body.inputText, // plain text body
        html: req.body.inputText // html body
    };
    
    transport.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err);
            req.flash("error", err);
            res.redirect("/contact");
        } else {
            console.log("The email was sent");
            req.flash("success", "Your message was sucesfully received.")
            res.redirect("/home")
        }
    });
});


// Test Site
// router.get("/testpage", function(req, res) {
//     // res.send("Nothing to see rn...");
//     res.render("./users/testpage");
// });

module.exports = router;