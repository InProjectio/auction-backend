var nodemailer = require('nodemailer');
var config = require('../../config')
const format = require('string-format')

// const emailTemplateBasic = require('../../emailtemplates/emailTemplateBasic')
// const emailTemplateRegister = require('../../emailtemplates/emailTemplateRegister')


const sendMail = async (subject, content, toEmail, attachments, type = 'BASIC') => {
    if (!config.isEnableSendMail) {
        return
    }

    const transportOpts = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_ADDRESS,
          pass: process.env.MAIL_PASSWORD,
        },
      };
      
      const transporter = nodemailer.createTransport(transportOpts);

    // content = format(emailTemplateBasic.content, content)

    const mailOptions = {
        from: `"In Project" <${process.env.MAIL_ADDRESS}>`, // sender address
        to: toEmail, // list of receivers
        subject, // Subject line
        // text: "I hope this message gets sent!",
        html: content,// plain text body
    }
    if (attachments) {
        mailOptions.attachments = attachments
    }
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    })
}



module.exports = {
    sendMail
}