const nodemailer = require('nodemailer');
const path = require('path');

const Email = require('email-templates');

const transporter = nodemailer.createTransport({
    // Dev mode
    // host: 'smtp.mailtrap.io',
    // port: 2525,
    // secure: false,
    // auth: {
    //     user: "6f204fbdb15dd0",
    //     pass: "36a535f5da7793"
    // }
    service: 'gmail',
    auth: {
      user: 'smart.rabbit.app@gmail.com',
      pass: '12ba456789'
    }
});

const root = path.join(__dirname, '../emails');
const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    views: { root },
});

module.exports = email;
