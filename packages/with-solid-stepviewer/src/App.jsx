import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { useDrawing, useClassCAD, BuerliPluginsGeometry } from '@buerli.io/react'
import { init, WASMClient } from '@buerli.io/classcad'
import { Measure, GlobalPlugins } from '@buerli.io/react-cad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './components/Pending'
import { plugin } from './components/Openfile'
import { elements } from './components/elements'
import { suspend } from 'suspend-react'
import { Buffer } from 'buffer'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }), { elements, globalPlugins: [Measure] })

export default function App() {
  const [buffer, set] = useState(null)
  useControls({ step: folder({ upload: plugin(set) }) })
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [1000, 1000, 0], zoom: 20, far: 10000 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[10, 5, -15]} angle={0.2} castShadow />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
        <Suspense fallback={<Status>Loading</Status>}>{buffer && <Model buffer={buffer} />}</Suspense>
        <Plugins />
      </Canvas>
      <Plugins dom />
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Plugins({ dom = false }) {
  const { drawingId } = useClassCAD('with-solid-stepviewer')
  if (dom) return <GlobalPlugins drawingId={drawingId} />
  else return <BuerliPluginsGeometry drawingId={drawingId} />
}

function Model({ buffer }) {
  const ref = useRef()
  const { api: { v1: api }, drawingId, Geometry } = useClassCAD("with-solid-stepviewer") // prettier-ignore
  const measurePlugin = useDrawing(drawingId, state => state.plugin.global[0])
  const pluginApi = useDrawing(drawingId, state => state.api.plugin)

  suspend(async () => {
    await api.common.clear()
    const { result: part } = await api.part.create({ name: 'Part' })
    const data = Buffer.from(buffer).toString('base64')
    await api.part.importFeature({ id: part, data, format: 'STP', encoding: 'base64', name: 'Import' })
  }, ['step', buffer])

  useLayoutEffect(() => {
    ref.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh')
        obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5, transparent: true, opacity: 0.5 })
    })
    pluginApi.setActiveGlobal(measurePlugin, true)
    pluginApi.setVisiblePlugin(measurePlugin, true)
  })

  return (
    <group ref={ref}>
      <Geometry selection />
    </group>
  )
}
