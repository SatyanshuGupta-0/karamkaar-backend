const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
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


// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//     },
//     connectionTimeout: 10000,
//     greetingTimeout: 10000,
//     socketTimeout: 10000,
// });

// const sendEmail = async (to, subject, text = "", html = "") => {
//     try {


//         const info = await transporter.sendMail({
//             from: `"ServiceHub" <${process.env.EMAIL}>`,
//             to,
//             subject,
//             text,
//             html,
//         });



//         return true;
//     } catch (error) {
//         console.error("❌ Email Error");
//         console.error("Message:", error.message);
//         console.error("Code:", error.code);
//         console.error("Command:", error.command);

//         return false;
//     }
// };

// module.exports = sendEmail;