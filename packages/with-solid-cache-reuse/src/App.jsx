import { Suspense, useState } from 'react'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, SoftShadows, Outlines } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Leva } from 'leva'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }))

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 0, 100], zoom: 80 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <directionalLight position={[20, 15, 15]} castShadow>
          <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 1, 1000]} />
        </directionalLight>
        <Physics>
          <Suspense fallback={<Status>Loading</Status>}>
            <RigidBody position={[0, 10, 0]} rotation={[4, 5, 6]} colliders="hull">
              <Model scale={0.03} />
            </RigidBody>
            <RigidBody position={[1, 20, 0]} rotation={[1, 2, 3]} colliders="hull">
              <Model scale={0.04} />
            </RigidBody>
            <RigidBody position={[-0.5, 40, -0.5]} rotation={[1, 2, 3]} colliders="hull">
              <Model scale={0.05} />
            </RigidBody>
          </Suspense>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.75} />
          </mesh>
          <CuboidCollider position={[0, -3, 0]} type="fixed" args={[40, 1, 40]} />
        </Physics>
        <SoftShadows size={10} samples={20} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Model({ lOuterBox = 90, lInnerBox = 80, dHole = 55, ...props }) {
  const { api: { v1: api }, drawing } = useClassCAD() // prettier-ignore
  const [hovered, hover] = useState(false)
  const geo = suspend(async () => {
    await api.common.clear()
    const { result: part } = await api.part.create({ name: 'Part' })
    const { result: ei } = await api.part.entityInjection({ id: part })
    // Create boxes and cylinders and subtract them
    const { result: b0 } = await api.solid.box({ id: ei, length: lOuterBox, width: lOuterBox, height: lOuterBox })
    const { result: b3 } = await api.solid.box({ id: ei, length: lInnerBox, width: lInnerBox, height: lInnerBox })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: b3 }] })
    const { result: cyl1 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl1 }] })
    const { result: cyl2 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.rotation({ id: ei, target: { id: cyl2 }, rotation: [0, Math.PI / 2, 0] })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl2 }] })
    const { result: cyl3 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.rotation({ id: ei, target: { id: cyl3 }, rotation: [Math.PI / 2, 0, 0] })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl3 }] })
    // Slice lower corners
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, -45, -15.556], normal: [-0.5, -0.5, -0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, -45, -15.556], normal: [0.5, -0.5, -0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, 45, -15.556], normal: [0.5, 0.5, -0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, 45, -15.556], normal: [-0.5, 0.5, -0.707] })
    //   // Slice upper corners
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, -45, 15.556], normal: [-0.5, -0.5, 0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, -45, 15.556], normal: [0.5, -0.5, 0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, 45, 15.556], normal: [0.5, 0.5, 0.707] })
    await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, 45, 15.556], normal: [-0.5, 0.5, 0.707] })
    return (await drawing.createBufferGeometry(b0))[0]
  }, ['whiffle', lOuterBox, lInnerBox, dHole])
  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        <Outlines thickness={0.5} />
      </mesh>
    </group>
  )
}
