
const nodemailer = require('nodemailer');
exports.sendEmail = async (req, res) => {
    try {
    const { name, message, email } = req.body;
    console.log('Request body:', req.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: name,
      text: `Message:\n${message}`
    };
    
    await transporter.verify();
    console.log("✅ SMTP connection successful");

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message });
  }
}