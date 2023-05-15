import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import { Robot } from './Robot'
import { Status, Out } from './Pending'

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
        <group position={[0, -1, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Robot scale={0.015} />
          </Suspense>
          <ContactShadows scale={20} blur={2} />
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}
