const verifyEmailTemplate = (username, otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-body {
                padding: 20px;
                color: #333333;
            }
            .email-footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #777777;
            }
            .otp {
                font-size: 20px;
                font-weight: bold;
                color: #4CAF50;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="email-body">
                <p>Hi <strong>${username}</strong>,</p>
                <p>Thank you for registering with VM App. Please use the following OTP to verify your email address:</p>
                <p class="otp">${otp}</p>
                <p>If you didn’t create an account, you can safely ignore this email.</p>
                <p>Thank you,<br>The Team<br>VM</p>
            </div>
            <div class="email-footer">
                <p>&copy; 2025 Your Company. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports= verifyEmailTemplate;