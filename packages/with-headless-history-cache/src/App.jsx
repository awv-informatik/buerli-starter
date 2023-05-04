import { Suspense, useRef } from 'react'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { Flange } from './components/Flange'
import { Status } from './components/Pending'

// Create a headless history socket
const buerli = headless(history, 'ws://localhost:9091')

export const App = () => (
  <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
    <color attach="background" args={['#f0f0f0']} />
    <ambientLight intensity={0.5} />
    <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
    <group position={[0, -1, 0]}>
      {/** The suspense fallback will fire on first load and show a moving sphere */}
      <Suspense fallback={<Fallback />}>
        <Center top>
          <Flange buerli={buerli} scale={0.015} rotation={[-Math.PI / 2, 0, 0]} />
        </Center>
      </Suspense>
      <ContactShadows blur={4} color="orange" />
    </group>
    <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
    <Environment preset="city" />
  </Canvas>
)

function Fallback() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
  })
  return (
    <mesh ref={ref} position={[0, 1.5, 0]}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
      <Status>Loading</Status>
    </mesh>
  )
}
