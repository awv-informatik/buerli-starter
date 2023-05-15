import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, AccumulativeShadows, RandomizedLight, CameraControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import { Assembly } from './Assembly'
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
            <Center top>
              <Assembly scale={0.03} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.95} color="red" opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-10, 10, -15]} bias={0.0001}  />
            </AccumulativeShadows>
          </Suspense>
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva titleBar={{ title: <Out /> }} />
    </>
  )
}
