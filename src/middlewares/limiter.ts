
import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = (windowMs: number, max: number) => {
    return rateLimit({
        windowMs, // Time window for rate limiting
        max,      // Maximum number of requests per windowMs
        message: 'Too many requests, please try again later.',
    });
};

export default rateLimitMiddleware;

