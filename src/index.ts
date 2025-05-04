import proxyRouter from '@/routes/proxy';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
dotenv.config();



const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(proxyRouter);

app.listen(port, () => {
    console.log(`\nProxy server running on port ${port}`)
})
