import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useBuerliCadFacade } from '@buerli.io/react'
import { ScgGraphicType } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

export default function App() {
  return (
    <>
      <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[-10, 5, -15]} angle={0.2} castShadow />
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Scene />
            <AccumulativeShadows alphaTest={0.65} frames={50} scale={20}>
              <RandomizedLight radius={4} position={[-10, 6, -15]} bias={0.0001} />
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

function Scene({ width = 50, ...props }) {
  const { api: { v1: api }, facade, Geometry } = useBuerliCadFacade('with-history-run') // prettier-ignore
  const geometry = useRef()

  useEffect(() => {
    async function run() {
      api.common.clear()
      const part = await api.part.create({ name: 'Part' })
      const wcsx = await api.part.workCSys({ id: part, rotation: [0, -width / 5, -width / 8] })
      await api.part.cylinder({ id: part, references: [wcsx], diameter: 10, height: width })
      const sel = (await facade.selectGeometry([ScgGraphicType.CIRCLE], 2)).map(sel => sel.graphicId)
      api.part.chamfer({ id: part, type: 'EQUAL_DISTANCE', references: sel, distance1: 2, distance2: 2, angle: 45 })
    }
    run()
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
            <Geometry selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
