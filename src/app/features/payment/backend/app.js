const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.listen(4242, () => console.log('Server running on port 4242'));