import { NextFunction, Request, Response } from 'express';

const allowlistMiddleware = (allowlist: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || '';
        if (allowlist.includes(ip)) {
            return next();
        }
        res.status(403).send('Forbidden');
    };
};

export default allowlistMiddleware;
