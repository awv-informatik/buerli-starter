import { Suspense, useState, useRef, useTransition } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { init, useHistory } from '@buerli.io/react'
import debounce from 'lodash/debounce'
import { easing } from 'maath'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'
import robotArm from './resources/Robot6Axis.ofb?raw'

init('https://awvstatic.com/classcad/dev/wasm/20240924.2')
const store = {
  asm: null,
  constraints: [
    { name: 'Base-J1', value: 0, step: 5, min: 0, max: 360, node: null },
    { name: 'J1-J2', value: 0, step: 1, min: -60, max: 160, node: null },
    { name: 'J2-J3', value: 0, step: 1, min: -230, max: 45, node: null },
    { name: 'J3-J4', value: 0, step: 1, min: -180, max: 180, node: null },
    { name: 'J4-J5', value: 0, step: 1, min: -90, max: 90, node: null },
    { name: 'J5-J6', value: 0, step: 1, min: -180, max: 180, node: null },
  ],
}

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight decay={0} position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
        <group position={[0, -3, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Robot scale={0.01} />
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

function Robot(props) {
  const { cache } = useHistory('with-history-cache-robot')
  // 1. Create scene, fetch constraints, return scene nodes
  const { nodes } = cache(
    async api => {
      const root = await api.load(robotArm, 'ofb')
      store.asm = root[0]
      store.constraints.forEach(async constraint => (constraint.node = await api.getRevoluteConstraint(store.asm, constraint.name)))
      return await api.createScene()
    },
    ['robot'],
  )

  // 2. Hold axis values in state, update them on change, useTransition creates pending state
  const [pending, start] = useTransition()
  const [values, setValues] = useState(store.constraints.map(constraint => constraint.value))
  useControls({
    robot6: folder(
      store.constraints.reduce(
        (prev, { node, name, ...config }, index) => ({
          ...prev,
          [name]: {
            ...config,
            onChange: debounce(v => start(() => setValues(values => values.map((value, i) => (i === index ? v : value)))), 40),
          },
        }),
        {},
      ),
    ),
  })

  // 3. Create a structure-only scene whenever values change
  const { nodes: structure } = cache(
    async api => {
      const constraints = store.constraints.map(({ node }, index) => ({
        constrId: node.constrId,
        paramName: 'zRotationValue',
        value: (values[index] / 180) * Math.PI,
      }))
      await api.update3dConstraintValues(...constraints)
      return await api.createScene(undefined, { structureOnly: true })
    },
    ['robot-struct', ...values],
  )

  // 4. useFrame to update the position and rotations of the nodes
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.children.forEach((child, index) => {
      easing.damp3(child.position, structure[`NAUO${index + 1}`].position, 0.1, delta)
      easing.dampQ(child.quaternion, structure[`NAUO${index + 1}`].quaternion, 0.1, delta)
    })
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
