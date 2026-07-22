const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    family: 4, // force IPv4 — Render's network can't reach Gmail over IPv6 (ENETUNREACH)
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        // Validate recipient email
        if (!to) throw new Error("Recipient email is not defined");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Invalid email format");

        const info = await transporter.sendMail({
            from: process.env.EMAIL, // Sender's address
            to, // Recipient's address
            subject, // Subject line
            text, // Plain text body
            html, // HTML body
        });

        console.log("Email sent successfully:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;