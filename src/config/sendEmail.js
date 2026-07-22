const sendEmail = require("./emailService");

const sendEmailFun = async (to, subject, text, html) => {
    const result = await sendEmail(to, subject, text, html);
    return result; // Simplified to return the boolean result directly
};

module.exports = sendEmailFun;
