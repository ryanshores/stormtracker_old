// // using SendGrid's v3 Node.js Library
// // https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var emailerObj = {};

emailerObj.sendTestEmail = function sendTestEmail(toEmail, toName, toSubject, toText){
    const msg = {
      to: toEmail,
      from: 'noreply@matdan.com',
      subject: toSubject,
      text: toText,
      html: '<strong>' + toText + '</strong>',
      templateId: '6e38fc11-2721-4c12-85f0-aa9fb43732ff',
      name: toName,
      substitutions: {
          title: 'test this damn thing',
          name: "Ryan"
      }
    };
    sgMail.send(msg);
    console.log("Sent message!");
    console.log(msg);
};

emailerObj.sendNewActivity = function sendNewActivity(Emails, Subject){
    const msg = {
      to: Emails,
      from: 'noreply@matdan.com',
      subject: Subject,
      templateId: '24b94141-c23b-4d66-bb0a-cdf18fd32745',
    };
    sgMail.sendMultiple(msg);
};

emailerObj.upgradeActivity = function upgradeActivity(Emails, Subject){
    const msg = {
      to: Emails,
      from: 'noreply@matdan.com',
      subject: Subject,
      templateId: '',
    };
    console.log(msg);
    // sgMail.sendMultiple(msg);
};

module.exports = emailerObj;

