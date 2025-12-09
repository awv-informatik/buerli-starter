import { Suspense, useState } from 'react'
import { useBuerliCadFacade } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, SoftShadows, Outlines, Edges } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Leva } from 'leva'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

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
  const { api: { v1: api }, facade } = useBuerliCadFacade() // prettier-ignore
  const [hovered, hover] = useState(false)
  const geo = suspend(async () => {
    await api.common.clear()
    const part = await api.part.create({ name: 'Part' })
    const ei = await api.part.entityInjection({ id: part })
    // Create boxes and cylinders and subtract them
    const b0 = await api.solid.box({ id: ei, length: lOuterBox, width: lOuterBox, height: lOuterBox })
    const b3 = await api.solid.box({ id: ei, length: lInnerBox, width: lInnerBox, height: lInnerBox })
    await api.solid.subtraction({ id: ei, target: b0, tools: [b3] })
    const cyl1 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
    await api.solid.subtraction({ id: ei, target: b0, tools: [cyl1] })
    const cyl2 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole, rotation: [0, Math.PI / 2, 0] })
    await api.solid.subtraction({ id: ei, target: b0, tools: [cyl2] })
    const cyl3 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole, rotation: [Math.PI / 2, 0, 0] })
    await api.solid.subtraction({ id: ei, target: b0, tools: [cyl3] })
    // Slice lower corners
    await api.solid.slice({ id: ei, target: b0, originPos: [-45, -45, -15.556], normal: [-0.5, -0.5, -0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [45, -45, -15.556], normal: [0.5, -0.5, -0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [45, 45, -15.556], normal: [0.5, 0.5, -0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [-45, 45, -15.556], normal: [-0.5, 0.5, -0.707] })
    //   // Slice upper corners
    await api.solid.slice({ id: ei, target: b0, originPos: [-45, -45, 15.556], normal: [-0.5, -0.5, 0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [45, -45, 15.556], normal: [0.5, -0.5, 0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [45, 45, 15.556], normal: [0.5, 0.5, 0.707] })
    await api.solid.slice({ id: ei, target: b0, originPos: [-45, 45, 15.556], normal: [-0.5, 0.5, 0.707] })
    return (await facade.createBufferGeometry(b0))[0]
  }, ['whiffle', lOuterBox, lInnerBox, dHole])
  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        <Outlines thickness={0.1} />
        <Edges />
      </mesh>
    </group>
  )
}
