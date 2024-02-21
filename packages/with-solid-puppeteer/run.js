import { writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'
import puppeteer from 'puppeteer'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

async function app() {
  const server = await createServer({ root: __dirname, server: { port: 1337 } })
  await server.listen()
  const browser = await puppeteer.launch()

  console.log('taking snapshots...')

  const blends = await getFiles('public/models/blends', '.stp', 'public/models/')
  const pipes = await getFiles('public/models/pipes', '.stp', 'public/models/')
  
  await Promise.all([
    ...blends.map(file => snapshot(browser, file)),
    ...pipes.map(file => snapshot(browser, file)),
    // ...
  ]),
    await browser.close()
  server.close()
}

app()

async function getFiles(directoryPath, extension, replace) {
  const fileNames = await readdir(directoryPath)
  return fileNames
    .map(fn => join(directoryPath, fn))
    .filter(file => file.endsWith(extension))
    .map(file => file.replace(replace, ''))
}

async function snapshot(browser, file) {
  console.log('  processing', file)
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1024 })
  await page.goto(`http://localhost:1337?file=models/${file}`)
  await page.waitForSelector('.complete')
  console.log('  ...')
  await writeFile(`public/models/${file}.png`, await page.screenshot())
  page.close()
}
