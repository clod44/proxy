import { Request, RequestHandler, Response, Router } from 'express';
import http from 'http';
import https from 'https';
import url from 'url';

const router = Router();

const handleM3U8 = (target: string, req: Request, res: Response, client: typeof http | typeof https) => {
    client.get(target, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        // Rewrite relative .ts and .m3u8 paths in the playlist to go through our proxy
        // This avoids broken requests like "localhost/segment.ts" (404),
        // and ensures they are fetched via "localhost/proxy?url=originaldomain.com/segment.ts"
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
}

const handleDefault = (target: string, res: Response, client: typeof http | typeof https) => {
    client.get(target, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
    }).on('error', () => {
        res.status(500).send('Proxy error');
    });
}

const handler: RequestHandler = (req: Request, res: Response) => {
    const target = req.query.url as string;
    if (!target) {
        res.status(400).send('Missing url param');
        return;
    }

    const client = target.startsWith('https') ? https : http;
    const ext = target.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'm3u8':
            return handleM3U8(target, req, res, client);
        default:
            return handleDefault(target, res, client);
    }
};

router.get('/proxy', handler);

export default router;
