import { chromium } from 'playwright'
import { spawn, execSync } from 'child_process'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const PORT = 4173

function getProductSlugs() {
  const result = JSON.parse(
    execSync('aws dynamodb scan --table-name matkewaali-products-prod --projection-expression "slug" --region us-east-1 --output json').toString()
  )
  return result.Items.map(item => item.slug.S)
}

function getStorySlugs() {
  const src = readFileSync(join(__dirname, '..', 'src', 'data', 'stories.ts'), 'utf8')
  return [...src.matchAll(/content\/stories\/([\w-]+)/g)].map(m => m[1])
}

async function startServer() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000)
    const check = (data) => { if (data.toString().includes('localhost')) { clearTimeout(timeout); resolve() } }
    server.stdout.on('data', check)
    server.stderr.on('data', check)
  })
  return server
}

async function prerender() {
  const productSlugs = getProductSlugs()
  const storySlugs = getStorySlugs()

  const routes = [
    '/about',
    '/contact',
    '/faq',
    '/terms',
    '/stories',
    ...storySlugs.map(s => `/stories/${s}`),
    '/products',
    ...productSlugs.map(s => `/products/${s}`),
  ]

  console.log(`Pre-rendering ${routes.length} routes...`)

  const server = await startServer()
  const browser = await chromium.launch()
  let success = 0

  for (const route of routes) {
    const page = await browser.newPage()
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
      const html = await page.content()
      const outDir = join(DIST, ...route.slice(1).split('/'))
      mkdirSync(outDir, { recursive: true })
      writeFileSync(join(outDir, 'index.html'), html)
      console.log(`  ✓ ${route}`)
      success++
    } catch (e) {
      console.error(`  ✗ ${route}: ${e.message}`)
    }
    await page.close()
  }

  await browser.close()
  server.kill()

  console.log(`\nPre-rendered ${success}/${routes.length} routes.`)
  if (success < routes.length) process.exit(1)
}

prerender().catch(err => { console.error(err); process.exit(1) })
