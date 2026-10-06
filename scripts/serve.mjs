/**
 * Serves dist/ the way Vercel does with this repo's vercel.json:
 * static files first, then trailing-slash redirects, then rewrites, then 404.html.
 *
 * Usage: npm run preview   (PORT=4173 by default)
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 4173
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json', '.map': 'application/json',
}

// Turn path-to-regexp style sources ("/app/:path*") into regular expressions
const rewrites = (config.rewrites ?? []).map(({ source, destination }) => ({
    pattern: new RegExp(`^${source.replace(/\/:\w+\*/g, '(?:/.*)?').replace(/:\w+/g, '[^/]+')}$`),
    destination,
}))

function fileFor(urlPath) {
    const file = path.join(DIST, urlPath)
    if (!file.startsWith(DIST)) return null
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file
    const index = path.join(file, 'index.html')
    if (fs.existsSync(index)) return index
    return null
}

function send(res, status, file) {
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
}

http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const urlPath = decodeURIComponent(url.pathname)

    const direct = urlPath.endsWith('/') || path.extname(urlPath) ? fileFor(urlPath) : null
    if (direct) return send(res, 200, direct)

    if (config.trailingSlash && !urlPath.endsWith('/') && !path.extname(urlPath)) {
        res.writeHead(308, { Location: `${url.pathname}/${url.search}` })
        return res.end()
    }

    const rewrite = rewrites.find((r) => r.pattern.test(urlPath))
    const target = rewrite && fileFor(rewrite.destination)
    if (target) return send(res, 200, target)

    send(res, 404, path.join(DIST, '404.html'))
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`))
