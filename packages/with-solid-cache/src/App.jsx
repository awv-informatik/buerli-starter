import * as THREE from 'three'
import { Suspense, useState, useTransition } from 'react'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, ScgGraphicType } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }))

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [10, 10, 0], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Center top>
              <Model scale={0.035} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-15, 10, -10]} bias={0.0001} />
            </AccumulativeShadows>
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Model(props) {
  const {
    api: { v1: api },
    drawing,
  } = useClassCAD('with-solid-cache')
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, trans] = useTransition()
  const [width, setWidth] = useState(100)
  const [cut1, setCut1] = useState(40)
  const [cut2, setCut2] = useState(40)
  const [offset, setOffset] = useState(1)

  useControls({
    bracket: folder({
      width: { value: width, min: 10, max: 100, step: 10, onChange: debounce(v => trans(() => setWidth(v)), 40) },
      cut1: { value: cut1, min: 10, max: 40, step: 10, onChange: debounce(v => trans(() => setCut1(v)), 40) },
      cut2: { value: cut2, min: 20, max: 60, step: 10, onChange: debounce(v => trans(() => setCut2(v)), 40) },
      offset: { value: offset, min: 1, max: 4, step: 1, onChange: debounce(v => trans(() => setOffset(v)), 40) },
    }),
  })

  // headless/cache will suspend if the dependencies change. The returned value will then be available
  // and can be used to render the scene. Cache is memoized, the same cache keys will immediately return
  // an already cached entry.
  const geo = suspend(async () => {
    api.common.clear()
    const { result: part } = await api.part.create({ name: 'Part' })
    const { result: ei } = await api.part.entityInjection({ id: part })
    const { result: ccShape } = await api.curve.shape({ id: ei })

    // Create a shape from points
    const points  = [[0, 0], [100, 0], [100, 20], [20, 20], [20, 50], [10, 50], [10, 100], [0, 100], [0, 0]] // prettier-ignore
    const shape = new THREE.Shape(points.map(xy => new THREE.Vector2(...xy)))
    await drawing.createThreeShape(ccShape, shape)
    // Extrusion
    const { result: solid } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, width] })
    const {
      result: { lines: edges1 },
    } = await api.part.getGeometryIds({
      id: part,
      lines: [{ pos: [100, 10, 0] }, { pos: [100, 10, 100] }, { pos: [5, 100, 100] }, { pos: [5, 100, 0] }],
    })
    const {
      result: { lines: edges2 },
    } = await api.part.getGeometryIds({
      id: part,
      lines: [{ pos: [10, 50, 50] }, { pos: [0, 0, 50] }, { pos: [20, 20, 50] }],
    })

    await api.solid.fillet({ geomIds: edges1, radius: 5 })
    await api.solid.fillet({ geomIds: edges2, radius: 5 })

    const { result: cyl1 } = await api.solid.cylinder({ id: ei, height: 300, diameter: cut1 })
    await api.solid.translation({ id: ei, target: cyl1, translation: [-50, 50, 50] })
    await api.solid.rotation({ id: ei, target: cyl1, rotation: [0, Math.PI / 2, 0] })

    const { result: cyl2 } = await api.solid.cylinder({ id: ei, height: 300, diameter: cut2 })
    await api.solid.translation({ id: ei, target: cyl2, translation: [55, 50, 50] })
    await api.solid.rotation({ id: ei, target: cyl2, rotation: [Math.PI / 2, 0, 0] })

    await api.solid.subtraction({ id: ei, target: solid, tools: [cyl1, cyl2] })
    await api.solid.offset({ id: ei, target: solid, distance: offset })
    const [geo] = await drawing.createBufferGeometry(part)
    return geo
  }, ['bracket', width, cut1, cut2, offset])

  return (
    <group {...props}>
      {/** The resulting geometry can be directly attached to a mesh, which is under your full control */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial metalness={0} color="#222" roughness={0.5} />
      </mesh>
      {pending && <Status>Pending</Status>}
    </group>
  )
}
