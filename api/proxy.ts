import { VercelRequest, VercelResponse } from '@vercel/node';
import http from 'http';
import https from 'https';
import url from 'url';
import allowlistMiddleware from '../middlewares/allowlist';
import { runMiddlewares } from '../middlewares/runMiddlewares';


const handleM3U8 = (target: string, req: VercelRequest, res: VercelResponse, client: typeof http | typeof https) => {
    client.get(target, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => {
            data += chunk;
        });
        proxyRes.on('end', () => {
            const base = target.substring(0, target.lastIndexOf('/') + 1);
            data = data.replace(/^(?!#)(.+\.(ts|m3u8))$/gm, (match, path) => {
                const full = url.resolve(base, path.trim());
                return `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/proxy?url=${encodeURIComponent(full)}`;
            });
            res.send(data);
        });
    }).on('error', () => {
        res.status(500).send('Proxy error');
    });
};

const handleDefault = (target: string, res: VercelResponse, client: typeof http | typeof https) => {
    client.get(target, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
    }).on('error', () => {
        res.status(500).send('Proxy error');
    });
};

const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW ? Number(process.env.RATE_LIMIT_WINDOW) : 15;
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100;
const ALLOWLIST = process.env.ALLOWLIST ? process.env.ALLOWLIST.split(',') : [];
const DEV_MODE = process.env.DEV_MODE === 'true';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Run middleware for dev mode (to simulate rate-limiting and allowlist checks)
    if (DEV_MODE) {
        const middlewares = [
            allowlistMiddleware(ALLOWLIST),
        ];
        runMiddlewares(middlewares, req, res);
    }

    const target = req.query.url as string;
    if (!target) {
        return res.status(400).send('Missing URL parameter');
    }

    const client = target.startsWith('https') ? https : http;
    const ext = target.split('.').pop()?.toLowerCase();

    // Proxy logic based on file extension
    switch (ext) {
        case 'm3u8':
            return handleM3U8(target, req, res, client);
        default:
            return handleDefault(target, res, client);
    }
}
