import * as THREE from 'three'
import { Suspense, useState, useRef, useTransition } from 'react'
import { solid } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import tunnel from 'tunnel-rat'
import { Status, Out } from './Pending'

// Create a headless history socket
const { cache } = headless(solid, 'ws://localhost:9091')
// Create a tunnel that will allow the canvas to write into the DOM
const title = tunnel()

export default function App() {
  return (
    <>
      <Canvas orthographic camera={{ position: [10, 10, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Center top>
              <Model scale={0.035} />
            </Center>
            <ContactShadows />
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva titleBar={{ title: <Out /> }} />
    </>
  )
}

function Model(props) {
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, trans] = useTransition()
  const [width, setWidth] = useState(100)
  const [cut1, setCut1] = useState(40)
  const [cut2, setCut2] = useState(40)
  const [offset, setOffset] = useState(1)
  const [hovered, hover] = useState(false)

  useControls({
    bracket: folder({
      width: {
        value: width,
        min: 10,
        max: 100,
        step: 10,
        // Debounce the slider to avoid too many requests with a safe margin of 100ms
        onChange: debounce(v => trans(() => setWidth(v)), 100),
      },
      cut1: { value: cut1, min: 20, max: 70, step: 10, onChange: debounce(v => trans(() => setCut1(v)), 100) },
      cut2: { value: cut2, min: 20, max: 60, step: 10, onChange: debounce(v => trans(() => setCut2(v)), 100) },
      offset: { value: offset, min: 1, max: 4, step: 1, onChange: debounce(v => trans(() => setOffset(v)), 100) },
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
      const solid = api.extrude([0, 0, width], shape)
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
      <mesh geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} castShadow receiveShadow>
        <meshStandardMaterial color={pending ? 'gray' : hovered ? 'hotpink' : 'orange'} />
      </mesh>
      {pending && <Status>Pending</Status>}
    </group>
  )
}
