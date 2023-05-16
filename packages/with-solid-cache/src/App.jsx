import * as THREE from 'three'
import { Suspense, useState, useTransition } from 'react'
import { solid } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { useTexture, Decal, AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'

// Create a headless history socket
const { cache } = headless(solid, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [10, 5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Center top>
              <Model scale={0.035} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-15, 10, -20]} bias={0.0001} />
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
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, trans] = useTransition()
  const [width, setWidth] = useState(100)
  const [cut1, setCut1] = useState(40)
  const [cut2, setCut2] = useState(40)
  const [offset, setOffset] = useState(1)
  const sticker = useTexture('/awv.png')

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
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial metalness={1} roughness={0.2} />
        <Decal position={[80, 15, 16]} scale={20} rotation={[Math.PI / 2, 0, -Math.PI / 3]}>
          <meshPhysicalMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-10}
            map={sticker}
            map-flipY={false}
            map-anisotropy={16}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            roughness={1}
            clearcoat={0.5}
            metalness={0.75}
            toneMapped={false}
          />
        </Decal>
      </mesh>
      {pending && <Status>Pending</Status>}
    </group>
  )
}
