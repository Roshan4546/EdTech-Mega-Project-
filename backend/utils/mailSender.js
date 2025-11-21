const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: 'StudyNotion || CodeHelp.com',
            to: email,
            subject: title,
            html: body
        });

        console.log("Email sent successfully:", info);
        return info;

    } catch (error) {
        console.log("Error in mailSender:", error.message);
        return null;
    }
};

module.exports = mailSender;
