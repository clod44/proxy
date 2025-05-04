import proxyRouter from '@/routes/proxy';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
dotenv.config();


const RATE_LIMIT_WINDOW = (process.env.RATE_LIMIT_WINDOW ? Number(process.env.RATE_LIMIT_WINDOW) : 15) * 60 * 1000;
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100;
console.log(RATE_LIMIT_WINDOW, RATE_LIMIT_MAX);
const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW, //minutes
    max: RATE_LIMIT_MAX, // max requests per windowMs
    message: 'Too many requests, please try again later.',
});


const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(limiter);

app.use(proxyRouter);


app.listen(port, () => {
    console.log(`\nProxy server running on port ${port}`)
})
