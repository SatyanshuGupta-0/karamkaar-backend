// Render's free tier blocks outbound traffic on SMTP ports (25, 465, 587)
// since Sept 2025 — so Gmail SMTP (nodemailer) can never work here.
// This uses Brevo's HTTPS API instead, which is NOT blocked.
//
// Setup:
// 1. Sign up free at https://www.brevo.com (300 emails/day free)
// 2. Go to Settings -> SMTP & API -> API Keys -> generate a new key
// 3. In Render dashboard -> Environment, add:
//      BREVO_API_KEY = your-api-key
//      EMAIL = your-verified-sender-email (must be a verified sender in Brevo)
//      EMAIL_FROM_NAME = Karamkaar (or whatever display name you want)

const sendEmail = async (to, subject, text, html) => {
    try {
        // Validate recipient email
        if (!to) throw new Error("Recipient email is not defined");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Invalid email format");

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    email: process.env.EMAIL,
                    name: process.env.EMAIL_FROM_NAME || "Karamkaar",
                },
                to: [{ email: to }],
                subject,
                textContent: text || undefined,
                htmlContent: html || undefined,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        console.log("Email sent successfully:", data.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;