import { expect, test } from 'vitest'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { init, WASMClient, BuerliCadFacade } from '@buerli.io/classcad'
import { api as baseApi } from '@buerli.io/core'

// Visit https://staging01.buerli.io/docs/quickstart/wasm to create your ClassCAD key
const classcadKey = ''
init(did => new WASMClient(did, { classcadKey }), { elements, globalPlugins: [Measure] })

async function getFiles(directoryPath, filter) {
  const fileNames = await readdir(directoryPath)
  return fileNames.map(fn => join(directoryPath, fn)).filter(filter)
}

test('radii', async () => {
  const drawing = new BuerliCadFacade()
  await drawing.connect('with-solid-vitest')
  const api = drawing.api.v1
  // Clear all solids
  api.common.clear()
  const part = await api.part.create({ name: 'Part' })

  // Run through /testfiles/*.stp
  const files = await getFiles('./models/blends', file => file.endsWith('.stp'))
  for (const file of files) {
    // Read & import file
    const stream = await readFile(file, null)
    await api.part.importFeature({ id: part, data: stream.buffer, format: 'STP', name: 'Import' })
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
