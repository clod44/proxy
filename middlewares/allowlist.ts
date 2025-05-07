import { VercelRequest, VercelResponse } from '@vercel/node';

const allowlistMiddleware = (allowlist: string[]) => {
    return (req: VercelRequest, res: VercelResponse, next: () => void) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (allowlist.includes(ip as string)) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    };
};

export default allowlistMiddleware;