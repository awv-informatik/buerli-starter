import { Solid } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Resize } from '@react-three/drei'
import tunnel from 'tunnel-rat'

const t = tunnel()
const { cache, useDrawingId } = headless(Solid, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows orthographic camera={{ position: [10, 10, 10], zoom: 500 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight decay={0} intensity={Math.PI} position={[10, 15, -15]} angle={0.4} penumbra={1} castShadow />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
        <Center>
          <Resize>
            <Model />
          </Resize>
        </Center>
      </Canvas>
      <t.Out />
    </>
  )
}

function Model(props) {
  const drawingId = useDrawingId()
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const file = urlParams.get('file')
  cache(
    async api => {
      const buffer = await fetch(file).then(res => res.arrayBuffer())
      await api.import(buffer)
    },
    ['step', file],
  )
  return (
    <group {...props}>
      <BuerliGeometry suspend drawingId={drawingId} />
      <t.In>
        <div className="complete" />
      </t.In>
    </group>
  )
}
