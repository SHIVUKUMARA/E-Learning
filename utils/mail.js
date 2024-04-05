const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

// Create Nodemailer transporter using SendGrid API key
const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

// Function to send Registration email using SendGrid
async function sendEmail(recipient, subject, message) {
  try {
    const mailOptions = {
      from: "shivukumaraspatil01@gmail.com", 
      to: recipient,
      subject: subject,
      text: message,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

module.exports = { sendEmail };
