import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { Asm } from './components/Asm'

export const App = () => (
  <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
    <color attach="background" args={['#f0f0f0']} />
    <ambientLight intensity={0.5} />
    <spotLight position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
    <group position={[0, -1, 0]}>
      {/** The suspense fallback will fire on first load and show a moving sphere */}
      <Suspense fallback={<Fallback />}>
        <Center top>
          <Asm scale={0.015} />
        </Center>
      </Suspense>
      <ContactShadows scale={20} blur={2} />
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
    </mesh>
  )
}
