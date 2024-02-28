#!/usr/bin/env node
'use strict'

import meow from 'meow'
import { writeFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'
import puppeteer from 'puppeteer'

const cli = meow(
  `
	Usage
	  $ npx cad2img [model.stp] [options]

	Options
    --shadows, -s       Shadows (default: true)
    --diffuse, -d       Diffuse (default: 3.14)
    --ambience, -a      Ambience (default: 1)
    --bg, -b            Background color (default: "#f0f0f0")
    --direction, -d     Direction (default: "[1,1,1]")
    --ext, -e           File extension for batch processing (default: stp)
`,
  {
    importMeta: import.meta,
    flags: {
      shadows: { type: 'boolean', shortFlag: 's', default: true },
      diffuse: { type: 'number', shortFlag: 'd', default: Math.PI },
      ambience: { type: 'number', shortFlag: 'a', default: 1 },
      bg: { type: 'string', shortFlag: 'b', default: '#f0f0f0' },
      direction: { type: 'string', shortFlag: 'd', default: '[1, 1, 1]' },
      ext: { type: 'string', shortFlag: 'e', default: 'stp' },
    },
  },
)

if (cli.input.length === 0) {
  console.log(cli.help)
} else {
  const file = cli.input[0]
  const params = Object.entries(cli.flags).reduce((acc, [key, value]) => acc + `&${key}=${value}`, '')
  const __dirname = fileURLToPath(new URL('.', import.meta.url))

  async function app() {
    const queue = []
    const server = await createServer({ root: __dirname, server: { port: 1337 } })
    await server.listen()
    const browser = await puppeteer.launch()
    const status = await stat(file)

    if (status.isFile()) {
      queue.push(file)
    } else if (status.isDirectory()) {
      queue.push(...(await getFiles(file, `.${cli.flags.ext}`)))
    }

    await Promise.all(queue.map(item => snapshot(browser, item)))
    await browser.close()
    server.close()
  }

  app()

  async function getFiles(directoryPath, extension, replace) {
    const fileNames = await readdir(directoryPath)
    return fileNames.map(fn => join(directoryPath, fn)).filter(file => file.endsWith(extension))
  }

  async function snapshot(browser, file) {
    console.log('  processing', file)
    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1024 })
    await page.goto(`http://localhost:1337?file=${file}${params}`)
    await page.waitForSelector('.complete')
    console.log('  ...')
    await writeFile(`${file}.png`, await page.screenshot())
    page.close()
  }
}
