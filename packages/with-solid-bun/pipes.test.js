import { expect, test } from 'bun:test'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import * as THREE from 'three'
import { init, SocketIOClient } from '@buerli.io/classcad'
import { api as baseApi } from '@buerli.io/core'
import { solid as Solid } from '@buerli.io/headless'

init(id => new SocketIOClient('ws://localhost:9091', id), {})

const a = new THREE.Vector3()
const b = new THREE.Vector3()
const solid = new Solid()
const instanceApi = new Promise(res => solid.init(res))

async function getFiles(directoryPath, filter) {
  const fileNames = await readdir(directoryPath)
  return fileNames.map(fn => join(directoryPath, fn)).filter(filter)
}

test('pipe-length-individual', async () => {
  const api = await instanceApi
  // Clear all solids
  api.clearSolids()
  // Run through /models/*.stp
  const files = await getFiles('./models', file => file.endsWith('.stp'))
  for (const file of files) {
    // Read file
    const buffer = await Bun.file(file).arrayBuffer()
    await api.import(buffer)
    // Test pipe length
    const state = baseApi.getState()
    const containers = Object.values(state.drawing.refs[solid.drawingId].graphic.containers)
    containers.forEach(container => {
      const surfaces = container.meshes.map(mesh => mesh.properties.surface)
      const cylinders = surfaces.filter(surface => surface.type === 'cylinder')
      const tubes = cylinders.reduce((prev, cur) => {
        if (!prev.some(el => a.fromArray(el.origin).equals(b.fromArray(cur.origin)))) prev.push(cur)
        return prev
      }, [])
      const height = tubes.reduce((prev, cur) => prev + cur.height, 0)
      expect(height).toBe(580.200229)
    })
  }
})

test('pipe-length-all', async () => {
  const api = await instanceApi
  const files = await getFiles('./models', file => file.endsWith('.stp'))
  let totalHeight = 0
  
  api.clearSolids()  
  for (const file of files) {
    // Read file
    const buffer = await Bun.file(file).arrayBuffer()
    await api.import(buffer)
    // Test pipe length
    const state = baseApi.getState()
    const containers = Object.values(state.drawing.refs[solid.drawingId].graphic.containers)
    containers.forEach(container => {
      const surfaces = container.meshes.map(mesh => mesh.properties.surface)
      const cylinders = surfaces.filter(surface => surface.type === 'cylinder')
      const tubes = cylinders.reduce((prev, cur) => {
        if (!prev.some(el => a.fromArray(el.origin).equals(b.fromArray(cur.origin)))) prev.push(cur)
        return prev
      }, [])
      totalHeight += tubes.reduce((prev, cur) => prev + cur.height, 0)      
    })    
  }
  expect(totalHeight).toBe(1740.600687)
})
