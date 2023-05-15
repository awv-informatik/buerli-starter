import { Suspense, useState, useRef, useTransition } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import debounce from 'lodash/debounce'
import { easing } from 'maath'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'
import robotArm from './resources/Robot6Axis.ofb?raw'

const buerli = headless(history, 'ws://localhost:9091')

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

function useAxis(key, config = { value: 0 }, start) {
  // Create state value
  const [value, setValue] = useState(config.value)
  // Tie it to leva GUI panel
  useControls({ robot6: folder({ [key]: { value, ...config, onChange: debounce(v => start(() => setValue(v)), 40) } }) })
  // On change update the constraint value
  return buerli.cache(
    async (api, store) => {
      const { constrId } = await api.getRevoluteConstraint(store.asm, key)
      const constrValue = { constrId: constrId, paramName: 'zRotationValue', value: (value / 180) * Math.PI }
      await api.update3dConstraintValues(constrValue)
      return value
    },
    ['robot-axis', key, value],
  )
}

function Robot(props) {
  // 1. Create scene, return scene nodes
  const nodes = buerli.cache(
    async (api, store) => {
      store.asm = (await api.load(robotArm, 'ofb'))[0]
      return (await api.createScene()).nodes
    },
    ['robot'],
  )

  // 2. Hold axis values in state, update them on change, useTransition creates pending state
  const [pending, start] = useTransition()
  const a1 = useAxis('Base-J1', { value: 0, step: 5, min: 0, max: 360 }, start)
  const a2 = useAxis('J1-J2', { value: 0, step: 1, min: -60, max: 160 }, start)
  const a3 = useAxis('J2-J3', { value: 0, step: 1, min: -230, max: 45 }, start)
  const a4 = useAxis('J3-J4', { value: 0, step: 1, min: -180, max: 180 }, start)
  const a5 = useAxis('J4-J5', { value: 0, step: 1, min: -90, max: 90 }, start)
  const a6 = useAxis('J5-J6', { value: 0, step: 1, min: -180, max: 180 }, start)

  // 3. Create a structure-only scene whenever values change
  const { nodes: structure } = buerli.cache(api => api.createScene(undefined, { structureOnly: true }), ['robot-struct', a1, a2, a3, a4, a5, a6])

  // 4. useFrame to update the position and rotations of the nodes
  const ref = useRef()
  useFrame((state, delta) => {
    for (let i = 0; i < 7; i++) {
      easing.damp3(ref.current.children[i].position, structure[`NAUO${i + 1}`].position, 0.1, delta)
      easing.dampQ(ref.current.children[i].quaternion, structure[`NAUO${i + 1}`].quaternion, 0.1, delta)
    }
  })

  // 5. The view is declarative, it just needs to hold the initial geometries
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes['J3 C3'].geometry} material={nodes['J3 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J1 C3'].geometry} material={nodes['J1 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J5 C3'].geometry} material={nodes['J5 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J4 C3'].geometry} material={nodes['J4 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J6 C3'].geometry} material={nodes['J6 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J2 C3'].geometry} material={nodes['J2 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['Base C3,S'].geometry} material={nodes['Base C3,S'].material} />
      {pending && <Status>Pending</Status>}
    </group>
  )
}
