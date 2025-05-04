import allowlistMiddleware from '@/middlewares/allowlist';
import rateLimitMiddleware from '@/middlewares/limiter';
import proxyRouter from '@/routes/proxy';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
dotenv.config();

const RATE_LIMIT_WINDOW = (process.env.RATE_LIMIT_WINDOW ? Number(process.env.RATE_LIMIT_WINDOW) : 15);
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100;
const ALLOWLIST = process.env.ALLOWLIST ? process.env.ALLOWLIST.split(',') : [];
const DEV_MODE = process.env.DEV_MODE === 'true';

const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Trust the first proxy in the chain. (heroku like vercel)
//app.set('trust proxy', 1);

if (DEV_MODE) {
    console.log('DEV_MODE is enabled. RATE_LIMIT and ALLOWLIST are DISABLED.');
} else {
    app.use(allowlistMiddleware(ALLOWLIST));
    app.use(rateLimitMiddleware(RATE_LIMIT_WINDOW * 60 * 1000, RATE_LIMIT_MAX));
}


app.use(proxyRouter);

app.listen(port, () => {
    console.log(`\nProxy server running on port ${port}`)
    if (!DEV_MODE) {
        console.log("RATE_LIMIT_WINDOW (minutes) : ", RATE_LIMIT_WINDOW);
        console.log("RATE_LIMIT_MAX : ", RATE_LIMIT_MAX);
        console.log("max requests per minute : ", RATE_LIMIT_MAX / RATE_LIMIT_WINDOW);
        console.log("ALLOWLIST : ", ALLOWLIST);
    }
    console.log("===========")
})
