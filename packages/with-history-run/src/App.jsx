import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { history } from '@buerli.io/headless'
import { BuerliGeometry, headless } from '@buerli.io/react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Resize, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { suspend } from 'suspend-react'

const buerli = headless(history, 'ws://localhost:9091')
buerli.useDrawingId = () => suspend(() => buerli.api.then(() => buerli.instance.drawingId), [buerli.instance])

export default function App({ width = 50 }) {
  useEffect(() => {
    buerli.run(async api => {
      const part = await api.createPart('Part')
      const wcsy = await api.createWorkCoordSystem(part, 8, [], [], [0, width / 3, 0], [Math.PI / 3, 0, 0])
      const wcsx = await api.createWorkCoordSystem(part, 8, [], [], [0, -width / 5, -width / 8], [0, 0, 0])
      const a = await api.cylinder(part, [wcsx], 10, width)
      const b = await api.cylinder(part, [wcsy], 10, width)
      await api.boolean(part, 0, [a, b])
    })
  }, [])

  return (
    <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight />
      <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
      <Suspense fallback={<Fallback />}>
        <group position={[0, -1, 0]}>
          <Scene />
          <AccumulativeShadows temporal alphaTest={0.65} frames={100} scale={20}>
            <RandomizedLight radius={4} position={[-10, 6, -15]} bias={0.0001} />
          </AccumulativeShadows>
        </group>
      </Suspense>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      <Environment preset="city" />
      <EffectComposer disableNormalPass multisampling={4}>
        <TiltShift2 blur={0.75} samples={6} />
      </EffectComposer>
    </Canvas>
  )
}

function Scene(props) {
  const geometry = useRef()
  const drawingId = buerli.useDrawingId()
  useLayoutEffect(() => {
    geometry.current.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
    })
  })
  return (
    <group {...props}>
      <Bounds fit observe margin={2}>
        <Resize scale={2}>
          <Center top ref={geometry} rotation={[0, -Math.PI / 2, 0]}>
            <BuerliGeometry drawingId={drawingId} suspend />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}

function Fallback() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
  })
  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
