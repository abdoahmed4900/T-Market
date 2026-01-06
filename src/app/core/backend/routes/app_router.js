const express = require('express');

const router = express.Router();

const { createPaymentIntent } = require('../controller/payment_controller')
const { sendEmail } = require('../controller/email_controller')
const { sendNotification,subscribeToNotifications,getNotificationKey } = require('../controller/notification_controller')

router.post('/create-payment-intent', createPaymentIntent)
router.post('/send-email', sendEmail)
router.post('/send-notification', sendNotification)
router.post('/subscribe-to-notifications', subscribeToNotifications)
router.get('/get-notification-key', getNotificationKey)
module.exports = router;
