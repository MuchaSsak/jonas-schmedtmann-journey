/**
 * Builds every project into one static site:
 *
 *   dist/
 *     index.html          <- project picker
 *     01-pure-react/      <- each project served under its own subpath
 *     ...
 *
 * Project type is detected from the folder:
 *   - no package.json      -> plain static files, copied as-is
 *   - vite                 -> vite build --base /<slug>/
 *   - react-scripts (CRA)  -> react-scripts build with PUBLIC_URL=/<slug>
 *   - next                 -> next build (static export, basePath from NEXT_BASE_PATH)
 *   - parcel               -> parcel build --public-url /<slug>/
 *   - anything else        -> npm run build with BASE_PATH and OUT_DIR set
 *
 * Usage:
 *   npm run build                         # build everything
 *   npm run build -- 10-worldwise js-08   # build only matching folders (prefix match)
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const CONCURRENCY = Number(process.env.BUILD_CONCURRENCY) || Math.max(1, Math.min(4, os.cpus().length - 1))
const PROJECT_DIR = /^(js-)?\d+-/

const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'projects.json'), 'utf8'))
const filters = process.argv.slice(2)

const projects = fs.readdirSync(ROOT)
    .filter((dir) => PROJECT_DIR.test(dir) && fs.statSync(path.join(ROOT, dir)).isDirectory())
    .filter((dir) => filters.length === 0 || filters.some((f) => dir.startsWith(f)))
    .sort()
    .map((slug) => {
        const dir = path.join(ROOT, slug)
        const pkgFile = path.join(dir, 'package.json')
        const pkg = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, 'utf8')) : null
        const deps = { ...pkg?.dependencies, ...pkg?.devDependencies }
        const type = !pkg ? 'static'
            : deps.next ? 'next'
            : deps.vite ? 'vite'
            : deps['react-scripts'] ? 'cra'
            : deps.parcel ? 'parcel'
            : 'script'
        const publicDir = ['public', 'static'].map((d) => path.join(dir, d)).find((d) => fs.existsSync(d))
        return { slug, dir, type, publicDir }
    })

if (projects.length === 0) {
    console.error('No projects matched', filters)
    process.exit(1)
}

if (filters.length === 0) fs.rmSync(DIST, { recursive: true, force: true })
fs.mkdirSync(DIST, { recursive: true })

function bin(project, pkgName, relPath) {
    const require = createRequire(path.join(project.dir, 'package.json'))
    return path.join(path.dirname(require.resolve(`${pkgName}/package.json`)), relPath)
}

function command(project, outDir) {
    const base = `/${project.slug}/`
    const env = { ...process.env, NODE_ENV: 'production' }
    switch (project.type) {
        case 'vite':
            return {
                args: [bin(project, 'vite', 'bin/vite.js'), 'build', '--base', base, '--outDir', outDir, '--emptyOutDir', '--logLevel', 'warn'],
                env: { ...env, CI: 'true' },
            }
        case 'cra':
            return {
                args: [bin(project, 'react-scripts', 'bin/react-scripts.js'), 'build'],
                env: {
                    ...env,
                    PUBLIC_URL: `/${project.slug}`,
                    BUILD_PATH: outDir,
                    GENERATE_SOURCEMAP: 'false',
                    SKIP_PREFLIGHT_CHECK: 'true',
                    DISABLE_ESLINT_PLUGIN: 'true',
                    // CRA turns warnings into errors when CI is set
                    CI: 'false',
                },
            }
        case 'next':
            return {
                args: [bin(project, 'next', 'dist/bin/next'), 'build'],
                env: { ...env, NEXT_BASE_PATH: `/${project.slug}`, NEXT_TELEMETRY_DISABLED: '1' },
                after: () => {
                    fs.rmSync(outDir, { recursive: true, force: true })
                    fs.cpSync(path.join(project.dir, 'out'), outDir, { recursive: true })
                },
            }
        case 'parcel':
            return {
                args: [bin(project, 'parcel', 'lib/bin.js'), 'build', 'index.html', '--dist-dir', outDir, '--public-url', base, '--no-source-maps', '--log-level', 'warn'],
                env,
                before: () => fs.rmSync(outDir, { recursive: true, force: true }),
            }
        case 'script':
            return {
                // npm_execpath is set when this runs through `npm run build`
                args: [process.env.npm_execpath, 'run', 'build'],
                env: { ...env, BASE_PATH: base, OUT_DIR: outDir },
                before: () => fs.rmSync(outDir, { recursive: true, force: true }),
            }
    }
}

function copyStatic(project, outDir) {
    fs.rmSync(outDir, { recursive: true, force: true })
    fs.cpSync(project.dir, outDir, {
        recursive: true,
        filter: (src) => src === project.dir || !/^(\.|node_modules$|.*\.md$|package(-lock)?\.json$)/.test(path.basename(src)),
    })
}

function run(project) {
    const outDir = path.join(DIST, project.slug)
    const started = Date.now()
    const done = (ok, log = '') => {
        const seconds = ((Date.now() - started) / 1000).toFixed(1)
        if (ok) console.log(`✓ ${project.slug} [${project.type}] (${seconds}s)`)
        else console.error(`✗ ${project.slug} [${project.type}] (${seconds}s)\n${log}`)
        return ok
    }

    if (project.type === 'static') {
        copyStatic(project, outDir)
        return Promise.resolve(done(true))
    }

    const { args, env, before, after } = command(project, outDir)
    before?.()
    return new Promise((resolve) => {
        const child = spawn(process.execPath, args, { cwd: project.dir, env })
        let log = ''
        child.stdout.on('data', (d) => (log += d))
        child.stderr.on('data', (d) => (log += d))
        child.on('close', (code) => {
            let ok = code === 0
            try {
                if (ok) {
                    after?.()
                    rewriteAbsolutePaths(project, outDir)
                    injectDemoBanner(project, outDir)
                }
            } catch (error) {
                ok = false
                log += `\n${error.stack}`
            }
            resolve(done(ok, log))
        })
    })
}

/**
 * Projects reference public files with absolute paths like '/img/logo.png'.
 * Bundlers only rewrite imported assets, not plain strings, so prefix any
 * string that points at a top-level public file/folder with the subpath.
 */
function rewriteAbsolutePaths(project, outDir) {
    // Next.js apps handle basePath themselves
    if (!project.publicDir || project.type === 'next') return
    const entries = fs.readdirSync(project.publicDir)
        .filter((e) => e !== 'index.html')
        .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    if (entries.length === 0) return
    // Skip strings already appended to a prefix: base + "/img", base.concat("/img")
    const pattern = new RegExp(`(?<!(?:\\+|concat\\()\\s*)(["'\`(])/(${entries.join('|')})(?=[/"'\`)?#\\\\ ])`, 'g')

    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name)
            if (entry.isDirectory()) walk(file)
            else if (/\.(js|mjs|html|css|txt|json)$/.test(entry.name)) {
                const source = fs.readFileSync(file, 'utf8')
                const result = source.replace(pattern, `$1/${project.slug}/$2`)
                if (result !== source) fs.writeFileSync(file, result)
            }
        }
    }
    walk(outDir)
}

/**
 * Apps with mocked data get a small "Demo mode" note. It sits outside the
 * React root, so single-page apps get it injected into index.html here.
 * Next.js apps hydrate the whole document, so they render it themselves.
 */
function injectDemoBanner(project, outDir) {
    if (!meta[project.slug]?.mocked || project.type === 'next') return
    const file = path.join(outDir, 'index.html')
    const banner = fs.readFileSync(path.join(ROOT, 'scripts', 'demo-banner.html'), 'utf8')
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</body>', `${banner}</body>`))
}

async function buildAll() {
    console.log(`Building ${projects.length} project(s) with concurrency ${CONCURRENCY}\n`)
    const queue = [...projects]
    const results = new Map()
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) {
            const project = queue.shift()
            results.set(project.slug, await run(project))
        }
    }))
    return results
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function writeIndex() {
    // List everything that exists in dist, so partial rebuilds keep the full list
    const built = fs.readdirSync(ROOT)
        .filter((dir) => PROJECT_DIR.test(dir) && fs.existsSync(path.join(DIST, dir, 'index.html')))
        .sort()
        .map((slug) => ({ slug, title: slug, course: 'React', ...meta[slug] }))

    const card = (p) => `
          <a class="card" href="/${p.slug}/" data-search="${escapeHtml(`${p.slug} ${p.title} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase())}">
            <span class="number">${escapeHtml(p.slug.match(/^(?:js-)?(\d+)/)[1])}</span>
            <span class="body">
              <span class="title">${escapeHtml(p.title)}</span>
              ${p.description ? `<span class="description">${escapeHtml(p.description)}</span>` : ''}
            </span>
            ${p.mocked ? '<span class="tag" title="Backend replaced with local demo data">Mocked data</span>' : ''}
          </a>`

    const section = (course, heading) => {
        const items = built.filter((p) => p.course === course)
        if (items.length === 0) return ''
        return `
        <section class="group" data-group>
          <h2>${escapeHtml(heading)} <span class="count">${items.length}</span></h2>
          <div class="grid">${items.map(card).join('')}
          </div>
        </section>`
    }

    const template = fs.readFileSync(path.join(ROOT, 'scripts', 'index.template.html'), 'utf8')
    fs.writeFileSync(
        path.join(DIST, 'index.html'),
        template
            .replace('<!-- SECTIONS -->', section('React', 'The Ultimate React Course') + section('JavaScript', 'The Complete JavaScript Course'))
            .replaceAll('<!-- COUNT -->', String(built.length)),
    )
    fs.copyFileSync(path.join(ROOT, 'scripts', '404.html'), path.join(DIST, '404.html'))
}

const results = await buildAll()
writeIndex()

const failed = [...results].filter(([, ok]) => !ok).map(([slug]) => slug)
console.log(`\nBuilt ${results.size - failed.length}/${results.size} project(s) into dist/`)
if (failed.length) {
    console.error(`Failed: ${failed.join(', ')}`)
    // Fail the deploy only if nothing could be built
    if (failed.length === results.size) process.exit(1)
}
