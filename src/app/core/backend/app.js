const express = require('express');
const cors = require('cors');
const router = require('./routes/app_router');
const webpush = require("web-push");

webpush.setVapidDetails(
  `mailto:${process.env.email}`,
  process.env.publicKey,
  process.env.privateKey
)

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:8080'],
    credentials: true,
}));
app.use('/api', router);

app.listen(4242, () => console.log('Server running on port 4242'));