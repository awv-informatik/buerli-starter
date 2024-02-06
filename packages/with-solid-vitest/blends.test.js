import { expect, test } from 'vitest'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { init, SocketIOClient } from '@buerli.io/classcad'
import { api as baseApi } from '@buerli.io/core'
import { solid as Solid } from '@buerli.io/headless'

init(id => new SocketIOClient('ws://localhost:9091', id), {})

const solid = new Solid()
const instanceApi = new Promise(res => solid.init(res))

async function getFiles(directoryPath, filter) {
  const fileNames = await readdir(directoryPath)
  return fileNames.map(fn => join(directoryPath, fn)).filter(filter)
}

test('radii', async () => {
  const api = await instanceApi
  // Clear all solids
  api.clearSolids()
  // Run through /testfiles/*.stp
  const files = await getFiles('./models/blends', file => file.endsWith('.stp'))
  for (const file of files) {
    // Read file
    const stream = await readFile(file, null)
    await api.import(stream.buffer)
    // Test cylinder radius
    const state = baseApi.getState()
    const containers = Object.values(state.drawing.refs[solid.drawingId].graphic.containers)
    containers.forEach(container => {
      const surfaces = container.meshes.map(mesh => mesh.properties.surface)
      const cylinders = surfaces.filter(surface => surface.type === 'cylinder')
      cylinders.forEach(meta => expect(meta.radius).toBeGreaterThanOrEqual(4))
    })
  }
})
