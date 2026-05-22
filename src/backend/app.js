const express = require('express');
const cors = require('cors');
const router = require('./routes/app_router');

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:4200', 'https://t-market-flame.vercel.app'],
    credentials: true,
}));
app.use('/api', router);