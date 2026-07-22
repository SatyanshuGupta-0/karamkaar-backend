/**
 * SMS gateway abstraction. Swap the body of this function for a real
 * provider (Twilio Verify, MSG91, AWS SNS) without touching any
 * controller that calls it — every caller just does
 * `await sendSmsFun(mobile, message)` and gets back true/false.
 *
 * No real SMS credentials are configured yet, so this currently just
 * logs the message to the server console — OTPs are still fully
 * usable for local/dev testing (check the server logs), the whole
 * mobile-OTP flow works end to end, it just doesn't hit a real
 * carrier until one of the providers below is wired in.
 */
const sendSmsFun = async (mobile, message) => {
  try {
    // ---- Twilio Verify example ----------------------------------
    // const twilioClient = require("twilio")(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // );
    // await twilioClient.messages.create({
    //   to: mobile,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: message,
    // });

    // ---- MSG91 example --------------------------------------------
    // await axios.post("https://api.msg91.com/api/v5/otp", {
    //   mobile,
    //   authkey: process.env.MSG91_AUTH_KEY,
    //   message,
    // });

    // ---- AWS SNS example --------------------------------------------
    // const sns = new SNSClient({ region: process.env.AWS_REGION });
    // await sns.send(new PublishCommand({ PhoneNumber: mobile, Message: message }));

    console.log(`[SMS -> ${mobile}] ${message}`);
    return true;
  } catch (error) {
    console.error("SMS send failed:", error.message);
    return false;
  }
};

module.exports = sendSmsFun;
