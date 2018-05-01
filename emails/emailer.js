// // using SendGrid's v3 Node.js Library
// // https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const async = require("async");

var Users = require('../models/users');
let emails = [];

var emailerObj = {
  
  sendtoryan: function sendtoryan(){
    const msg = {
      to: 'ryan.shores@me.com',
      from: 'test@example.com',
      subject: 'Sending every 6 hours',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail.send(msg);
  },
  
  sendTestEmail: function sendTestEmail(){
    async.waterfall([
      // Get list of users email and name
      function(done){
        Users.find({}, function( err, users ){
          if( err ) { 
            console.log( err );
            done(err);
          }
          users.forEach(function(user){
            var userObj = {
              name: user.name,
              email: user.email
            };
            emails.push(userObj);
          });
          done(null, emails);
        });
      },
      // Make the message
      function(emails, done){
        let msg = {
          to: emails,
          from: 'noreply@matdan.com',
          subject: "Test Email",
          text: "Test Text",
          html: '<strong>' + "Test Text" + '</strong>',
          templateId: '6e38fc11-2721-4c12-85f0-aa9fb43732ff',
          substitutions: {
              title: 'test this damn thing',
              name: "Ryan"
          },
          mail_settings: {
            sandbox_mode: {
              enable: ( process.env.SANDBOX == 'true' ) ? true : false
            }
          }
        };
        done(null, msg, 'done');
      }
    ], function(err, msg){
      if( err ){
        console.log(err);
      } else {
        sgMail.sendMultiple(msg, (error, result) => {
          if (error) {
            console.log(error);
          }
          else {
            console.log("Successfully sent test emails");
          }
        });
      }
    });
  },
  
  sendNewActivity: function sendNewActivity(Subject){
    async.waterfall([
      // Get list of users email and name
      function(done){
        Users.find({}, function( err, users ){
          if( err ) { 
            console.log( err );
            done(err);
          }
          users.forEach(function(user){
            var userObj = {
              name: user.name,
              email: user.email
            };
            emails.push(userObj);
          });
          done(null, emails);
        });
      },
      // Make the message
      function(emails, done){
        const msg = {
          to: emails,
          from: 'noreply@matdan.com',
          subject: Subject,
          templateId: '24b94141-c23b-4d66-bb0a-cdf18fd32745',
          mail_settings: {
            sandbox_mode: {
              enable: ( process.env.SANDBOX == 'true' ) ? true : false
            }
          }
        };
        done(null, msg, 'done');
      }
    ], function(err, msg){
      if( err ){
        console.log(err);
      } else {
        sgMail.sendMultiple(msg, (error, result) => {
          if (error) {
            console.log(error);
          }
          else {
            console.log("Successfully sent new activity emails");
          }
        });
      }
    });
  },
  
  upgradedActivity: function upgradedActivity(Subject){
    async.waterfall([
      // Get list of users email and name
      function(done){
        Users.find({}, function( err, users ){
          if( err ) { 
            console.log( err );
            done(err);
          }
          users.forEach(function(user){
            var userObj = {
              name: user.name,
              email: user.email
            };
            emails.push(userObj);
          });
          done(null, emails);
        });
      },
      // Make the message
      function(emails, done){
        const msg = {
          to: emails,
          from: 'noreply@matdan.com',
          subject: Subject,
          templateId: '3a87a842-4447-4190-a25d-6e76b44bcced',
          mail_settings: {
            sandbox_mode: {
              enable: ( process.env.SANDBOX == 'true' ) ? true : false
            }
          }
        };
        done(null, msg, 'done');
      }
    ], function(err, msg){
      if( err ){
        console.log(err);
      } else {
        sgMail.sendMultiple(msg, (error, result) => {
          if (error) {
            console.log(error);
          }
          else {
            console.log("Successfully sent storm upgarde emails");
          }
        });
      }
    });
  }
  
};

module.exports = emailerObj;

