import nodemailer from 'nodemailer';

// Create a transporter object using your email service credentials
const transporter = nodemailer.createTransport({
    // Configure your email service here (e.g., Gmail, SendGrid)
    service: 'gmail',
    auth: {
        user: "ogrelistproject@gmail.com",
        pass: "tppczqfgvqofuglp",
    },
});

// Base email template
const baseEmailTemplate = `
  <html lang="en">
  <head>
    <title>Reminder</title>
  </head>
  <body>
    <p>Hello!</p>
    <p>This is a reminder for: {{reminderItem}}</p>
    <p>Thank you,</p>
    <p>Your Ogre List Team</p>
  </body>
  </html>
`;

export async function sendReminderEmail(to: string, subject: string, reminderItem: string) {
    // Populate the template
    const emailText = baseEmailTemplate.replace('{{reminderItem}}', reminderItem);

    const mailOptions = {
        from: "ogrelistproject@gmail.com",
        to,
        subject,
        html: emailText, // Use html instead of text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending reminder email to ${to}:`, error);
    }
}