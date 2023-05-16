import { Suspense, useState } from 'react'
import { solid } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

const { cache } = headless(solid, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 5, 10], zoom: 80 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[10, 15, -15]} angle={0.2} castShadow />
        <Physics debug>
          <Suspense fallback={<Status>Loading</Status>}>
            <RigidBody position={[0, 10, 0]} rotation={[4, 5, 6]} colliders="hull">
              <Model scale={0.035} />
            </RigidBody>
            <RigidBody position={[2, 20, 0]} rotation={[1, 2, 3]} colliders="hull">
              <Model scale={0.035} />
            </RigidBody>
          </Suspense>
          <ContactShadows position={[0, -2, 0]} scale={20} blur={2} />
          <CuboidCollider position={[0, -3, 0]} type="fixed" args={[40, 1, 40]} />
        </Physics>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
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
      </mesh>
    </group>
  )
}
