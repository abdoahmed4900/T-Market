const express = require('express');

const router = express.Router();

const { createPaymentIntent } = require('../controller/payment_controller')
const { sendEmail } = require('../controller/email_controller')

router.post('/create-payment-intent', createPaymentIntent)
router.post('/send-email', sendEmail)
module.exports = router;
