const nodemailer = require("nodemailer");

console.log("======================================");
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);
console.log("======================================");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS.replace(/\s/g, "").trim(),
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    tls: {
        rejectUnauthorized: false,
    },
});

// Verify SMTP on startup
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP Connected Successfully");
    } catch (err) {
        console.log("❌ SMTP Connection Failed");
        console.log("Message:", err.message);
        console.log("Code:", err.code);
        console.log("Command:", err.command);
        console.log(err);
    }
})();

const sendEmail = async (to, subject, text = "", html = "") => {
    try {
        console.log("======================================");
        console.log("Sending Email...");
        console.log("To:", to);
        console.log("Subject:", subject);

        if (!to) {
            throw new Error("Recipient email is missing");
        }

        const info = await transporter.sendMail({
            from: `"ServiceHub" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email Sent");
        console.log("Message ID:", info.messageId);
        console.log("======================================");

        return true;
    } catch (err) {
        console.log("======================================");
        console.log("❌ Email Send Failed");
        console.log("Message:", err.message);
        console.log("Code:", err.code);
        console.log("Command:", err.command);
        console.log(err);
        console.log("======================================");

        return false;
    }
};

module.exports = sendEmail;