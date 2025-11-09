const stripe = require('../config/stripe');

exports.createPaymentIntent = async (req, res) => {
    const { amount } = req.body;
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
        res.status(500).json({ error: err.message });
    }
}