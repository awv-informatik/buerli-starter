import * as THREE from 'three'
import { Suspense, memo, useState, useTransition, useDeferredValue } from 'react'
import { useBuerliCadFacade } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [10, 10, 0], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Model scale={0.035} />
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

// A useState that will debounce and set values via React pending transitions w/o blocking the UI
function usePendingState(key, start, initialState, config = {}) {
  const [value, setValue] = useState(initialState)
  const deferredValue = useDeferredValue(value)
  // useControls is a hook from the leva library, it creates GUI panels for key:value pairs
  useControls({ bracket: folder({ [key]: { value: initialState, ...config, onChange: debounce(v => start(() => setValue(v)), 40) } }) })
  return deferredValue
}

function Model(props) {
  const { api: { v1: api }, facade } = useBuerliCadFacade('with-solid-cache') // prettier-ignore
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, start] = useTransition()
  const width = usePendingState('width', start, 100, { min: 40, max: 100, step: 10 })
  const cut1 = usePendingState('cut1', start, 40, { min: 20, max: 30, step: 5 })
  const cut2 = usePendingState('cut2', start, 40, { min: 20, max: 50, step: 10 })
  const offset = usePendingState('offset', start, 1, { min: 0.5, max: 4, step: 0.5 })

  // cache will suspend if the dependencies change. The returned value will then be available
  // and can be used to render the scene. Cache is memoized, the same cache keys will immediately return
  // an already cached entry.
  const geo = suspend(async () => {
    api.common.clear()
    const part = await api.part.create({ name: 'Part' })
    const ei = await api.part.entityInjection({ id: part })
    const ccShape = await api.curve.shape({ id: ei })

    // Create a shape from points
    const points  = [[0, 0], [100, 0], [100, 20], [20, 20], [20, 50], [10, 50], [10, 100], [0, 100], [0, 0]] // prettier-ignore
    const shape = new THREE.Shape(points.map(xy => new THREE.Vector2(...xy)))
    await facade.createThreeShape(ccShape, shape)
    // Extrusion
    const solid = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, width] })
    const { lines: edges1 } = await api.part.getGeometryIds({
      id: part,
      lines: [{ pos: [100, 10, 0] }, { pos: [5, 100, 0] }, { pos: [100, 10, width] }, { pos: [5, 100, width] }],
    })
    const { lines: edges2 } = await api.part.getGeometryIds({
      id: part,
      lines: [{ pos: [10, 50, width / 2] }, { pos: [0, 0, width / 2] }, { pos: [20, 20, width / 2] }],
    })

    await api.solid.fillet({ id: ei, geomIds: edges1, radius: 5 })
    await api.solid.fillet({ id: ei, geomIds: edges2, radius: 5 })

    const cyl1 = await api.solid.cylinder({
      id: ei,
      height: 300,
      diameter: cut1 + 0.5,
      translation: [-50, 50, 50],
      rotation: [0, Math.PI / 2, 0],
      rotateFirst: false,
    })

    const cyl2 = await api.solid.cylinder({
      id: ei,
      height: 300,
      diameter: cut2 + 0.5,
      translation: [55, 50, 50],
      rotation: [Math.PI / 2, 0, 0],
      rotateFirst: false,
    })

    await api.solid.subtraction({ id: ei, target: solid, tools: [cyl1, cyl2] })
    await api.solid.offset({ id: ei, target: solid, distance: offset })
    return (await facade.createBufferGeometry(part))[0]
  }, ['bracket', width, cut1, cut2, offset])

  return (
    <>
      <Center top>
        <group {...props}>
          {/** The resulting geometry can be directly attached to a mesh, which is under your full control */}
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial metalness={0} color="#222" roughness={0.5} />
          </mesh>
          {pending && <Status>Pending</Status>}
        </group>
      </Center>
      <Shadows width={width} cut1={cut1} cut2={cut2} offset={offset} />
    </>
  )
}

// Memoize shadows, so that they will only re-calculate when props change
const Shadows = memo(() => {
  return (
    <AccumulativeShadows alphaTest={0.85} opacity={0.85} frames={40} scale={20}>
      <RandomizedLight radius={6} position={[-15, 10, -10]} bias={0.0001} />
    </AccumulativeShadows>
  )
})
