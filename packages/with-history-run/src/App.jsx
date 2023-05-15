import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { BrepElemType, ChamferType } from '@buerli.io/classcad'
import { history } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { suspend } from 'suspend-react'
import { Status, Out } from './Pending'

const buerli = headless(history, 'ws://localhost:9091')
buerli.useDrawingId = () => suspend(() => buerli.api.then(() => buerli.instance.drawingId), [buerli.instance])

export default function App() {
  const drawingId = buerli.useDrawingId()
  return (
    <>
      <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Scene drawingId={drawingId} />
            <AccumulativeShadows alphaTest={0.65} frames={50} scale={20}>
              <RandomizedLight radius={4} position={[-10, 6, -15]} bias={0.0001} />
            </AccumulativeShadows>
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
        <EffectComposer disableNormalPass multisampling={4}>
          <TiltShift2 blur={0.25} samples={6} />
        </EffectComposer>
      </Canvas>
      <Leva titleBar={{ title: <Out /> }} />
    </>
  )
}

function Scene({ drawingId, width = 50, ...props }) {
  const geometry = useRef()
  useEffect(() => {
    buerli.run(async (api, store) => {
      const part = await api.createPart('Part')
      const wcsx = await api.createWorkCoordSystem(part, 8, [], [], [0, -width / 5, -width / 8], [0, 0, 0])
      await api.cylinder(part, [wcsx], 10, width)      
      const edges = (store.edges = await api.findOrSelect(part, BrepElemType.EDGE, 2, null))      
      await api.chamfer(part, ChamferType.EQUAL_DISTANCE, edges, 2, 2, 45)
    })
  }, [])

  useLayoutEffect(() => {
    geometry.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
    })
  })

  return (
    <group {...props}>
      <Bounds fit observe margin={1.75}>
        <Resize scale={2}>
          <Center top ref={geometry} rotation={[0, -Math.PI / 4, 0]}>
            <BuerliGeometry drawingId={drawingId} suspend selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}