import { expect, test } from 'vitest'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { init, WASMClient, ClassCAD } from '@buerli.io/classcad'
import { api as baseApi } from '@buerli.io/core'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }), { elements, globalPlugins: [Measure] })

async function getFiles(directoryPath, filter) {
  const fileNames = await readdir(directoryPath)
  return fileNames.map(fn => join(directoryPath, fn)).filter(filter)
}

test('radii', async () => {
  const drawing = new ClassCAD()
  await drawing.connect('with-solid-vitest')
  const api = drawing.api.v1
  // Clear all solids
  api.common.clear()
  const { result: part } = await api.part.create({ name: 'Part' })

  // Run through /testfiles/*.stp
  const files = await getFiles('./models/blends', file => file.endsWith('.stp'))
  for (const file of files) {
    // Read & import file
    const stream = await readFile(file, null)
    const data = Buffer.from(stream.buffer).toString('base64')
    await api.part.importFeature({ id: part, data, format: 'STP', encoding: 'base64', name: 'Import' })
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
