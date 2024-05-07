import { Suspense, useState } from 'react'
import { solid } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, SoftShadows, Outlines } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

const { cache } = headless(solid, 'ws://localhost:9091')

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
  const [hovered, hover] = useState(false)
  const geo = cache(
    async api => {
      const b0 = api.box(lOuterBox, lOuterBox, lOuterBox)
      const b3 = api.box(lInnerBox, lInnerBox, lInnerBox)
      api.subtract(b0, false, b3)
      const cyl1 = api.cylinder(2 * lOuterBox, dHole)
      api.subtract(b0, false, cyl1)
      const cyl2 = api.cylinder(2 * lOuterBox, dHole)
      api.rotateTo(cyl2, [0, Math.PI / 2, 0])
      api.subtract(b0, false, cyl2)
      const cyl3 = api.cylinder(2 * lOuterBox, dHole)
      api.rotateTo(cyl3, [Math.PI / 2, 0, 0])
      api.subtract(b0, false, cyl3)
      api.slice(b0, [-45, -45, -15.556], [-0.5, -0.5, -0.707])
      api.slice(b0, [45, -45, -15.556], [0.5, -0.5, -0.707])
      api.slice(b0, [45, 45, -15.556], [0.5, 0.5, -0.707])
      api.slice(b0, [-45, 45, -15.556], [-0.5, 0.5, -0.707])
      api.slice(b0, [-45, -45, 15.556], [-0.5, -0.5, 0.707])
      api.slice(b0, [45, -45, 15.556], [0.5, -0.5, 0.707])
      api.slice(b0, [45, 45, 15.556], [0.5, 0.5, 0.707])
      api.slice(b0, [-45, 45, 15.556], [-0.5, 0.5, 0.707])
      return await api.createBufferGeometry(b0)
    },
    ['whiffle', lOuterBox, lInnerBox, dHole],
  )
  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />        
        <Outlines thickness={0.5} />
      </mesh>
    </group>
  )
}
