import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, MeshTransmissionMaterial, Center, AccumulativeShadows, RandomizedLight, CameraControls, Environment } from '@react-three/drei'
import { init, useHistory } from '@buerli.io/react'
import { Leva } from 'leva'
import as1ac214 from './resources/as1_ac_214.stp?raw'
import { Status, Out } from './Pending'

init('https://awvstatic.com/classcad/dev/wasm/20240925.1')

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight decay={0} position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
        <group position={[0, -2, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Center top>
              <Assembly scale={0.03} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} color="red" opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-10, 10, -15]} bias={0.0001} />
            </AccumulativeShadows>
          </Suspense>
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Assembly(props) {
  const { cache } = useHistory('with-history-cache-as1ac214-jsx')
  const { nodes } = cache(async api => api.createScene(await api.load(as1ac214, 'stp')), ['as1_ac_214-jsx'])
  const [gBolt, mBolt] = [nodes['870'].geometry, nodes['870'].material]
  const [gNut, mNut] = [nodes['79A'].geometry, nodes['79A'].material]
  const [gBracket, mBracket] = [nodes['52D'].geometry, nodes['52D'].material]
  const [gPlate, mPlate] = [nodes['100'].geometry, nodes['100'].material]
  const [gBar, mBar] = [nodes['A52'].geometry, nodes['A52'].material]
  return (
    <group {...props} dispose={null}>
      <group position={[64.64, 125, 282.53]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh castShadow receiveShadow geometry={gBracket} material={mBracket} position={[232.53, 85.36, 50]} />
      </group>
      <group position={[115.36, 25, 282.53]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh castShadow receiveShadow geometry={gBracket} material={mBracket} position={[232.53, 85.36, 50]}>
          <MeshTransmissionMaterial thickness={10} anisotropy={1} chromaticAberration={1} roughness={0.75} samples={20} clearcoat={1} />
        </mesh>
      </group>
      <group position={[190, -101.75, -70.53]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow geometry={gBar} material={mBar} position={[130.53, 176.75, 100]} rotation={[0, 0, Math.PI / 2]} />
        <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[130.53, 176.75, 186.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
        <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[130.53, 176.75, 13.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      </group>
      <mesh castShadow receiveShadow geometry={gPlate} material={mPlate} position={[90, 75, 10]}>
        <Html
          occlude
          transform
          distanceFactor={200}
          position={[-80, 80, 20]}
          rotation={[0, 0, 0]}
          style={{ padding: '10px 20px', borderRadius: 7, background: 'black', color: 'white' }}>
          &lt;Hello/&gt; 👋
        </Html>
      </mesh>
    </group>
  )
}
