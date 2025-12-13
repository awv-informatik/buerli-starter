import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { useDrawing, useBuerliCadFacade, BuerliPluginsGeometry } from '@buerli.io/react'
import { GlobalPlugins } from '@buerli.io/react-cad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './components/Pending'
import { plugin } from './components/Openfile'
import { suspend } from 'suspend-react'

export default function App() {
  const [buffer, set] = useState(null)
  useControls({ step: folder({ upload: plugin(set) }) })
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [1000, 1000, 0], zoom: 20, far: 10000 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[10, 5, -15]} angle={0.2} castShadow />
        <OrbitControls makeDefault />
        <Environment preset="city" />
        <Suspense fallback={<Status>Loading</Status>}>
          <Center>
            {buffer && <Model buffer={buffer} />}
            <Plugins />
          </Center>
        </Suspense>
      </Canvas>
      <Plugins dom />
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Plugins({ dom = false }) {
  const { drawingId } = useBuerliCadFacade('with-solid-stepviewer')
  if (dom) return <GlobalPlugins drawingId={drawingId} />
  else return <BuerliPluginsGeometry drawingId={drawingId} />
}

function Model({ buffer }) {
  const ref = useRef()
  const { api: { v1: api }, drawingId, Geometry } = useBuerliCadFacade("with-solid-stepviewer") // prettier-ignore
  const measurePlugin = useDrawing(drawingId, state => state.plugin.global[0])
  const pluginApi = useDrawing(drawingId, state => state.api.plugin)

  suspend(async () => {
    await api.common.clear()
    await api.common.load({ data: buffer, format: 'STP', name: 'Import' })
  }, ['step', buffer])

  useLayoutEffect(() => {
    ref.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5, transparent: true, opacity: 0.5 })
    })
    pluginApi.setActiveGlobal(measurePlugin, true)
    pluginApi.setVisiblePlugin(measurePlugin, true)
  })

  return (
    <group ref={ref}>
      <Geometry selection />
    </group>
  )
}
