const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const stripe = require('./config/stripe');

const app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true }
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/send-email', async (req, res) =>  {
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
});

app.listen(4242, () => console.log('Server running on port 4242'));