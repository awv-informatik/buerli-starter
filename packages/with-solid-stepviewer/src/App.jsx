import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { solid } from '@buerli.io/headless'
import { useDrawing, elements, headless, BuerliPluginsGeometry, BuerliGeometry } from '@buerli.io/react'
import { Measure, GlobalPlugins } from '@buerli.io/react-cad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'
import { plugin } from './Openfile'

const { cache, useDrawingId } = headless(solid, 'ws://localhost:9091', {
  elements,
  globalPlugins: [Measure],
})

export default function App() {
  const drawingId = useDrawingId()
  const [buffer, set] = useState(null)
  useControls({ step: folder({ upload: plugin(set) }) })
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [1000, 1000, 0], zoom: 20, far: 10000 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[10, 5, -15]} angle={0.2} castShadow />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
        <Suspense fallback={<Status>Loading</Status>}>{buffer && <Model buffer={buffer} />}</Suspense>
        <BuerliPluginsGeometry drawingId={drawingId} />
      </Canvas>
      <GlobalPlugins drawingId={drawingId} />      
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Model({ buffer }) {
  const ref = useRef()
  const drawingId = useDrawingId()
  const measurePlugin = useDrawing(drawingId, state => state.plugin.global[0])
  const pluginApi = useDrawing(drawingId, state => state.api.plugin)

  cache(async api => await api.import(buffer), ['step', buffer])

  useLayoutEffect(() => {
    ref.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh')
        obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5, transparent: true, opacity: 0.5 })
    })
    pluginApi.setActiveGlobal(measurePlugin, true)
    pluginApi.setVisiblePlugin(measurePlugin, true)
  })

  return (
    <group ref={ref}>
      <BuerliGeometry suspend drawingId={drawingId} selection />
    </group>
  )
}
