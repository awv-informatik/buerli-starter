import * as THREE from 'three'
import { Suspense, useState, useTransition } from 'react'
import { init, useSolid } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'

// Create a headless history socket
init('https://awvstatic.com/classcad/dev/wasm/20240925.1')

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
            <Center top>
              <Model scale={0.035} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-15, 10, -10]} bias={0.0001} />
            </AccumulativeShadows>
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Model(props) {
  const { cache } = useSolid('with-solid-cache')
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, trans] = useTransition()
  const [width, setWidth] = useState(100)
  const [cut1, setCut1] = useState(70)
  const [cut2, setCut2] = useState(40)
  const [offset, setOffset] = useState(1)

  useControls({
    bracket: folder({
      width: { value: width, min: 10, max: 100, step: 10, onChange: debounce(v => trans(() => setWidth(v)), 40) },
      cut1: { value: cut1, min: 20, max: 70, step: 10, onChange: debounce(v => trans(() => setCut1(v)), 40) },
      cut2: { value: cut2, min: 20, max: 60, step: 10, onChange: debounce(v => trans(() => setCut2(v)), 40) },
      offset: { value: offset, min: 1, max: 4, step: 1, onChange: debounce(v => trans(() => setOffset(v)), 40) },
    }),
  })

  // headless/cache will suspend if the dependencies change. The returned value will then be available
  // and can be used to render the scene. Cache is memoized, the same cache keys will immediately return
  // an already cached entry.
  const geo = cache(
    async api => {
      // Extrusion
      const points = [[0, 0], [100, 0], [100, 20], [20, 20], [20, 50], [10, 50], [10, 100], [0, 100], [0, 0]] // prettier-ignore
      const shape = new THREE.Shape(points.map(xy => new THREE.Vector2(...xy)))
      const solid = await api.extrude([0, 0, width], shape)
      // Fillet edges
      const edges1 = api.pick(solid, 'edge', [100, 10, 0], [100, 10, 100], [5, 100, 100], [5, 100, 0])
      const edges2 = api.pick(solid, 'edge', [10, 50, 50], [0, 0, 50], [20, 20, 50])
      api.fillet(5, edges1)
      api.fillet(5, edges2)
      // Boolean subtract
      const cyl1 = api.cylinder(300, cut1)
      api.moveTo(cyl1, [-50, 50, 50])
      api.rotateTo(cyl1, [0, Math.PI / 2, 0])
      const cyl2 = api.cylinder(300, cut2)
      api.moveTo(cyl2, [55, 50, 50])
      api.rotateTo(cyl2, [Math.PI / 2, 0, 0])
      api.subtract(solid, true, cyl1, cyl2)
      // Offset body
      api.offset(solid, offset)
      return await api.createBufferGeometry(solid)
    },
    ['bracket', width, cut1, cut2, offset],
  )

  return (
    <group {...props}>
      {/** The resulting geometry can be directly attached to a mesh, which is under your full control */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial metalness={0} color="#222" roughness={0.5} />
      </mesh>
      {pending && <Status>Pending</Status>}
    </group>
  )
}
