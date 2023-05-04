import { Suspense } from 'react'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, OrbitControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import tunnel from 'tunnel-rat'
import { Fallback } from './components/Fallback'
import { Flange } from './components/Flange'

// Create a headless history socket
const buerli = headless(history, 'ws://localhost:9091')
// Create a tunnel that will allow the canvas to write into the DOM
const title = tunnel()

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<title.In>Loading ...</title.In>}>
          <group position={[0, -1, 0]}>
            <Center top>
              <Flange buerli={buerli} tunnel={title} scale={0.01} rotation={[-Math.PI / 2, 0, 0]} />
            </Center>
            <ContactShadows />
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <title.Out /> }} />
    </>
  )
}