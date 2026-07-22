const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// Verify SMTP Connection on server start
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed");
        console.error(error);
    } else {
        console.log("✅ SMTP Server Ready");
    }
});

const sendEmail = async (
    to,
    subject,
    text = "",
    html = ""
) => {
    try {
        console.log("====================================");
        console.log("Sending Email...");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("EMAIL:", process.env.EMAIL);
        console.log(
            "PASSWORD EXISTS:",
            !!process.env.EMAIL_PASS
        );

        if (!to) {
            throw new Error("Recipient email missing");
        }

        const info = await transporter.sendMail({
            from: `"ServiceHub" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email Sent Successfully");
        console.log("Message ID:", info.messageId);
        console.log("====================================");

        return true;
    } catch (error) {
        console.error("====================================");
        console.error("❌ Email Sending Failed");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Command:", error.command);
        console.error(error);
        console.error("====================================");

        return false;
    }
};

module.exports = sendEmail;