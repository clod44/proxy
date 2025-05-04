# proxy
express proxy server that can stream m3u8

## usage
 - `pnpm install`
 - `pnpm start`

open `http://localhost:PORT` or whatever for testing.
 - `domain.com/proxy?url=example.com/file.pdf`
 - `domain.com/proxy?url=example.com/image.jpg`
 - `domain.com/proxy?url=example.com/video.m3u8`

you will need a HSL supporting player to be able to play the m3u8 videos.

## env
see `.env.example` for more
```
PORT=3000
# minutes
RATE_LIMIT_WINDOW=5
# requests per window minutes 
RATE_LIMIT_MAX=100
# allowed domains. if testing locally, your ip wont be visible. try "::1" instead.
ALLOWLIST=example.com,test.com,::1
# disable security middlewares
DEV_MODE=false
```