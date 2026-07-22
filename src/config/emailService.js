const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4, // 👈 FORCE IPv4 — ye asli fix hai
    connectionTimeout: 20000, // 20 sec tak try karega, phir fail
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

        return ("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;
