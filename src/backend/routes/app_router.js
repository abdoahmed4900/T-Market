const express = require('express');

const router = express.Router();

const { createPaymentIntent } = require('../controller/payment_controller')
const { sendEmail } = require('../controller/email_controller')

router.post('/create-payment-intent', createPaymentIntent)
router.post('/send-email', sendEmail)
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});
module.exports = router;
