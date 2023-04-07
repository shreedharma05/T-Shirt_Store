const nodemailer = require('nodemailer')

const mailhelper = async (options) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({
        from: "tom@lco.dev",
        to: options.toMail,
        subject: options.subject,
        text: options.message
    })
}

module.exports = mailhelper