const stripe = require('../config/stripe');

exports.createPaymentIntent = async (req, res) => {
    const { amount } = req.body;
    console.log('Received amount:', amount);
    try {
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount,
                currency: 'usd',
                automatic_payment_methods: { enabled: true },
            }
        );
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message ?? error.statusText });
    }
}