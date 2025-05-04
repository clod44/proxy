import { Request, RequestHandler, Response, Router } from 'express';
import http from 'http';
import https from 'https';
import url from 'url';

const router = Router();

const handler: RequestHandler = (req: Request, res: Response) => {
    const target = req.query.url as string;
    if (!target) {
        res.status(400).send('Missing url param');
        return;
    }

    const client = target.startsWith('https') ? https : http;

    if (target.endsWith('.m3u8')) {
        client.get(target, (proxyRes) => {
            proxyRes.headers['content-type'] = 'application/vnd.apple.mpegurl';
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });

            //update relative ts paths to use our proxy
            //otherwise it will try to look for ts files in the same domain like "localhost/file1.ts 404 !!"
            proxyRes.on('end', () => {
                const base = target.substring(0, target.lastIndexOf('/') + 1);
                data = data.replace(/^(?!#)(.+\.(ts|m3u8))$/gm, (match, path) => {
                    const full = url.resolve(base, path.trim());
                    return `${req.protocol}://${req.get('host')}/proxy?url=${encodeURIComponent(full)}`;
                });
                res.send(data);
            });


        }).on('error', () => {
            res.status(500).send('Proxy error');
        });

    } else if (target.endsWith('.ts')) {
        client.get(target, (proxyRes) => {
            proxyRes.headers['content-type'] = 'video/MP2T';
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
        }).on('error', () => {
            res.status(500).send('Proxy error');
        });
    } else {
        client.get(target, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
        }).on('error', () => {
            res.status(500).send('Proxy error');
        });
    }
};

router.get('/proxy', handler);

export default router;
