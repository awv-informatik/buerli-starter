import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { ChamferType, WorkCoordSystemType } from '@buerli.io/classcad'
import { EdgeTypes } from '@buerli.io/core'
import { history } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

const buerli = headless(history, 'ws://localhost:9091')

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
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Scene({ drawingId, width = 50, ...props }) {
  const geometry = useRef()
  useEffect(() => {
    buerli.run(async api => {
      const part = await api.createPart('Part')
      const wcsx = await api.createWorkCoordSystem(part, WorkCoordSystemType.WCS_CUSTOM, [], [0, -width / 5, -width / 8], [0, 0, 0])
      await api.cylinder(part, [wcsx], 10, width)
      const selection = (await api.selectGeometry(EdgeTypes, 2)).map(sel => sel.graphicId)
      await api.chamfer(part, ChamferType.EQUAL_DISTANCE, selection, 2, 2, 45)
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
