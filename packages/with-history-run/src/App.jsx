import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, ScgGraphicType } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }))

export default function App() {
  return (
    <>
      <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[-10, 5, -15]} angle={0.2} castShadow />
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Scene />
            <AccumulativeShadows alphaTest={0.65} frames={50} scale={20}>
              <RandomizedLight radius={4} position={[-10, 6, -15]} bias={0.0001} />
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

function Scene({ width = 50, ...props }) {
  const { api: { v1: api }, drawing, Geometry } = useClassCAD('with-history-run')
  const geometry = useRef()

  useEffect(() => {
    async function run() {
      const { result: part } = await api.part.create({ name: 'Part' })
      const { result: wcsx } = await api.part.workCSys({ id: part, rotation: [0, -width / 5, -width / 8] })
      await api.part.cylinder({ id: part, references: [wcsx], diameter: 10, height: width })
      const sel = (await drawing.selectGeometry([ScgGraphicType.CIRCLE], 2)).map(sel => sel.graphicId)
      api.part.chamfer({ id: part, type: 'EQUAL_DISTANCE', references: sel, distance1: 2, distance2: 2, angle: 45 })
    }
    run()
  }, [])

  useLayoutEffect(() => {
    geometry.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
    })
  })

  return (
    <group {...props}>
      <Bounds fit observe margin={1.75}>
        <Resize scale={2}>
          <Center top ref={geometry} rotation={[0, -Math.PI / 4, 0]}>
            <Geometry selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
