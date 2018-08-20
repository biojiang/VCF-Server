/**
 * Created by shxx_ on 2017/3/16.
 */

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: 'gps_smtp@163.com',
        pass: 'syjcb225'
    }
});

exports.send = function(to, html, subject) {
    var mailOptions = {
            from: 'DiseaseGPS admin<gps_smtp@163.com>', // login user must equel to this user
            to: to,
            subject: subject,
            html: html
        };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
};
