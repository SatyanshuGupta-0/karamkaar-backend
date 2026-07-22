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

const sendEmail = async (to, subject, text = "", html = "") => {
    try {
        console.log("========== SEND EMAIL ==========");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("EMAIL:", process.env.EMAIL);
        console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "FOUND" : "NOT FOUND");

        const info = await transporter.sendMail({
            from: `"ServiceHub" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email Sent");
        console.log("Message ID:", info.messageId);

        return true;
    } catch (error) {
        console.error("❌ Email Error");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Command:", error.command);

        return false;
    }
};

module.exports = sendEmail;