import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, MeshTransmissionMaterial, Center, AccumulativeShadows, RandomizedLight, CameraControls, Environment } from '@react-three/drei'
import { useBuerliCadFacade } from '@buerli.io/react'
import { Leva } from 'leva'
import as1ac214 from './resources/as1_ac_214.stp'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

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
  const { api: { v1: api }, facade } = useBuerliCadFacade('with-history-cache-as1ac214-jsx') // prettier-ignore
  const { nodes, materials } = suspend(async () => {
    await api.common.clear()
    const part = await api.part.create({ name: 'Part' })
    await api.part.importFeature({ id: part, data: as1ac214, format: 'STP', name: 'Part' })
    return await facade.createScene(part)
  }, ['as1_ac_214-jsx'])

  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Part_0.geometry} material={materials.Part_0_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_1.geometry} material={materials.Part_1_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_2.geometry} material={materials.Part_2_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_3.geometry} material={materials.Part_3_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_4.geometry} material={materials.Part_4_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_5.geometry} material={materials.Part_5_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_6.geometry} material={materials.Part_6_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_7.geometry} material={materials.Part_7_material} />
      <mesh geometry={nodes.Part_8.geometry}>
        <MeshTransmissionMaterial thickness={5} anisotropy={1} chromaticAberration={1} roughness={1} samples={10} clearcoat={1} />
      </mesh>
      <mesh castShadow receiveShadow geometry={nodes.Part_9.geometry} material={materials.Part_9_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_10.geometry} material={materials.Part_10_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_11.geometry} material={materials.Part_11_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_12.geometry} material={materials.Part_12_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_13.geometry} material={materials.Part_13_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_14.geometry} material={materials.Part_14_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_15.geometry} material={materials.Part_15_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_16.geometry} material={materials.Part_16_material} />
      <mesh castShadow receiveShadow geometry={nodes.Part_17.geometry} material={materials.Part_17_material}>
        <Html
          occlude
          transform
          distanceFactor={200}
          position={[0, 150, 30]}
          rotation={[0, 0, 0]}
          style={{ padding: '10px 20px', borderRadius: 7, background: 'black', color: 'white' }}>
          &lt;Hello/&gt; 👋
        </Html>
      </mesh>
    </group>
  )
}
