import { Suspense, useState } from 'react'
import { useBuerliCadFacade } from '@buerli.io/react'
import { init, WASMClient } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, SoftShadows, Outlines } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Leva } from 'leva'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRpdzIrR0d0N0JIZWk1VEhwK2xHZDJpRHhFOEJBQkEwUEFpSzd6ZXpmM0lCZzB2cklka0xkWHFQdzlzenZxTHlDUkM1N1A0MEFaQnNiSlZ4aFRGNjg2WEdkd1c0Wis0b0l1V2NXNU83ZUh6MktnTTY0Mzh3Wk4rWVlIaVBMS2sxTTFLZ2d5SUxpZGdXLzUzSXFRZks5ZkNUZk9KcjRoU3VnWUJiUGpyVzdqZkJ3cE96RGhlZWpaOHl2NkNkU3orSzlnMmJQa0xaa240akV1aDBJM0tzVUhMSmt2b1Y0dStJN2EvdUw3RHd2bUFkK29yRGdXZHFaeXpjTmlUTGltSlFFZDVsMm02L1lKN0hnOFlFeDhXaXZMVW5TZHpGaEM2UVllSGorS2lYaXdPbDZMVS95ZjEyOVNud09kbXNrRU5QbjJkSVRoTTgxL21MR0V0ajlGcytTLy9JaUs4aWhwaDBIMUsreVkwU3h5b1BmNU5veU9aRks4a1RidGRYMmNlekVpRFhhSmZ5OG9GOEtYNFpDOUxyc3F3WHdLaEdxejRtUnk5Q0pMRnBJamtCZ3FubUNzM0hMS3cvdmZwSXlndzFITXB2TU1aemc4RUY1ZDZlQkRKYS9BemJNWWVLTzFSZzNldlBrNkFGNXZLSmxIbldHYzhaazQ0MktaMXZsdzZVazM0SzdtUmVwdURNYXBURHY3Q3lOM1NkVDZ3eC9TR25NSEhydmJXUkFheG50MlhFVEpycFFIQ3RVTUhlOENidVBMeHpKUTY5NERoOVJOWTFhMFlRQnh1U0dKaU1pVUtmSjZzUUxVT2FUQ1VTNkR4YXpIM293cXcwbndpbSs0Nk1MTVlpcG4rMG9rT1NIZUc1b29JZkFteVpLaDdyVlErTUpwUW5SY0NqVXhXencyRUlCbWNaYjFmNnY1QndRWERsSWx6Nmc0VWw5Vlg1N0JscUYyMVovZy9TdjdBSE1rcGNLSWhvWHFDcWxWUkFqS1lLUmlaVHVOQk1OQnZqQllQNVVYUVVVNktFTUJLcTM1ZDA1TDk0YStSeE5rUGl5bVlhL0FpZmxwUDVFZTRXLzdKWkFqOXcrWnBYVmI5R3IrRkNPd3RDcCtDcmkzOEpDSlpQVCt4SEFnckhtcjFNc2FsVjFFbjVQdldaZ0k0ZXlVNDNmUHA3dE9rSE51UkpETjVTYXBrek1VNFNGbER2V3M2emhRY05CVGhuOW5EVmdBZ3V6eUJPN2wwK3lraytFZUFncXQzZXFEa1hkNDlqbGNEL1BEVUNYdVA0ZWRFT0VFWWxMb2w1V1o0ZDZjUlVTQ1VwdFJJWlN6dVRGc1ZPNGNTV08yRWdaaVV3MVovWWcyZnFvb2xEMFl6TGpPQjFEWkhwZlIxN2xwS2pUd2dJNTNUdUtmVGtOZFhUV3J1eU9PaE5CWjd6ZThwM1k4UlZGYWJYUTEzR1k0Qm9pYTBTVGZOOU1LaFM2ZWRJR1lXY1lGcjBxLzk0bE5OeFQwV2FPUWlIb2h3VXZWQnIrcW04UmxxM1pMMWpCWU1LWGVFclRkbzcwUXA1RTFVdTArVzhNMFdwU2dRQ3BPK2NRRll3TWwwclBmZE5SQUNPQU5DcGQ5SWRWdEphZnhQMHRJUE8xUG5wOTRYbklnSkFPdEh1aUNNT0hFaGN1Ykp1dVRBeGF0L2tBSlBKcjd5UU8xZVYybEE4WDlOM3N5MFlnU0JSK2kvd1hWTDRZcGRZKytHK25yNVBDdTJTSkRiLzZnU2NVV3JQcHJ0MENzQ3VBVTE2SHAwL1Jna1ZSWG9rVHpHMFQ1TG1QcnZmcFlCKzNQRUpDVFVPbWlldXRqczRXLy9ZbHMvMU9YdlY3WHYwVXFBODRoS3lLbnpTOXp5ak5KWmpiU0FVUHdFYW9PZkZGUEFVaXc3NXZMZ0FxRjlIVk5GbnFBeU1jOUpyUWpMYzY3ejVZYStWK2EyUFB6VVpBdVB0Vm9tV2dzanlIZXFGa2xUaFZ5RnZZei9jKzhwMkx1ODZmclRWbEJXTjFQTXRqVmhPRk1nNmFZUVBMTGhUcDkyUCtSR2I2UzY1TzVVYnpaUEF5Z1RGbnhqQVU5eHdLenJBaEdaMGRBOEJMcG05WkRWa2dhRnBVRThNUXg1NFVnNGx2cC8rbGhOOEU4aU5INVRCQWNYZkVrVUpoUkY1eEp0V1JUMm1Uc0Y3d3lMWEtmZW9nelh0SDBtNW8zMlovczdqdEQxT3ZrOTYxODlNSFVzNSsrdjZWbkNMZnBuMFcxVGdZR1NReWswSExSZlhPWHREc0lJTStFYko4Sm4rR0xoR1RRMnZQNER4NDQwN05Gb1hDZEtiNS90MUF6K25HNFNidGcwWmlMaGNkV0N4RENMeUVJSldKWVArMDREWlpmQVREcHpzazh6VkQzc3pyQ0w5MThmM0xnOHg4Y2xOWnpDZ25YajBSQmo2eitEV0pCQzBybnhDVkZrZnEzRUhOQWhLVEI0TmF6NkhkOUhiUXVxM3ljVjJYN3dINnE4bzJPdjBFdGlhbW52YmtIcVhsUkd1YWhRZ1BRPT0='
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
  const { api: { v1: api }, drawing } = useBuerliCadFacade() // prettier-ignore
  const [hovered, hover] = useState(false)
  const geo = suspend(async () => {
    await api.common.clear()
    const part = await api.part.create({ name: 'Part' })
    const ei = await api.part.entityInjection({ id: part })
    // Create boxes and cylinders and subtract them
    const b0 = await api.solid.box({ id: ei, length: lOuterBox, width: lOuterBox, height: lOuterBox })
    const b3 = await api.solid.box({ id: ei, length: lInnerBox, width: lInnerBox, height: lInnerBox })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: b3 }] })
    const cyl1 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl1 }] })
    const cyl2 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.rotation({ id: ei, target: { id: cyl2 }, rotation: [0, Math.PI / 2, 0] })
    await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl2 }] })
    const cyl3 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
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
