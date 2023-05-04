import { Suspense, useState, useRef, useTransition } from 'react'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, OrbitControls, Environment } from '@react-three/drei'
import { useControls } from 'leva'
import debounce from 'lodash/debounce'

// Create a headless history socket
const { cache } = headless(history, 'ws://localhost:9091')

export default function App() {
  return (
    <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight />
      <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
      {/** The suspense fallback will fire on first load and show a moving sphere */}
      <Suspense fallback={<Fallback />}>
        <Model scale={0.1} rotation={[0, -Math.PI / 2, 0]} />
      </Suspense>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      <Environment preset="city" />
    </Canvas>
  )
}

function Model(props) {
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, transition] = useTransition()
  const [width, setWidth] = useState(50)
  const [hovered, hover] = useState(false)

  useControls({
    width: {
      value: width,
      min: 30,
      max: 60,
      step: 10,
      // Debounce the slider to avoid too many requests with a safe margin of 100ms
      onChange: debounce(v => transition(() => setWidth(v)), 100),
    },
  })

  // headless/cache will suspend if the dependencies change. The returned value will then be available
  // and can be used to render the scene. Cache is memoized, the same cache keys will immediately return
  // an already cached entry.
  const [geo] = cache(
    async api => {
      const part = await api.createPart('Part')
      const wcsy = await api.createWorkCoordSystem(part, 8, [], [], [0, width / 3, 0], [Math.PI / 3, 0, 0])
      const wcsx = await api.createWorkCoordSystem(part, 8, [], [], [0, -width / 5, -width / 8], [0, 0, 0])
      const a = await api.cylinder(part, [wcsx], 10, width)
      const b = await api.cylinder(part, [wcsy], 10, width)
      await api.boolean(part, 0, [a, b])
      return await api.createBufferGeometry(part)
    },
    ["cyclinders", width],
  )
  return (
    <Center cacheKey={width} {...props}>
      {/** The resulting geometry can be directly attached to a mesh, which is under your full control */}
      <mesh geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} castShadow receiveShadow >
        <meshStandardMaterial color={pending ? 'gray' : hovered ? 'hotpink' : 'orange'} />
      </mesh>
    </Center>
  )
}

function Fallback() {
  const ref = useRef()
  useFrame(state => {
    ref.current.position.x = Math.sin(state.clock.elapsedTime * 2)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 64, 64]} />
      <meshBasicMaterial color="#556" />
    </mesh>
  )
}
