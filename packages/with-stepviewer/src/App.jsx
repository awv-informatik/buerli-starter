import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { useDrawing, useBuerliCadFacade, BuerliPluginsGeometry } from '@buerli.io/react'
import { AppStyle, GlobalPlugins } from '@buerli.io/react-cad'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './components/Pending'
import { plugin } from './components/Openfile'

// The dropped file. Leva keeps the upload's callback from the render that added it, which may not be the one that
// mounted, so the file goes to a store rather than to App's state
let file = null
const listeners = new Set()
const setFile = buffer => {
  file = buffer
  listeners.forEach(listener => listener())
}
const subscribe = listener => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export default function App() {
  const buffer = useSyncExternalStore(subscribe, () => file)
  useControls({ step: folder({ upload: plugin(setFile) }) })
  return (
    <>
      <Canvas shadows="percentage" orthographic camera={{ position: [1000, 1000, 0], zoom: 20, far: 10000 }}>
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
  if (dom)
    return (
      // react-cad's styles: its windows (the measure plugin's) let the canvas below take the pointer
      <div className="rcad">
        <AppStyle />
        <GlobalPlugins drawingId={drawingId} />
      </div>
    )
  else return <BuerliPluginsGeometry drawingId={drawingId} />
}

function Model({ buffer }) {
  const ref = useRef()
  // Loads the STEP file into the drawing, and again when another is dropped
  const { drawingId, Geometry } = useBuerliCadFacade(
    'with-solid-stepviewer',
    async ({ v1: api }) => {
      await api.common.clear()
      await api.common.load({ data: buffer, format: 'STP', name: 'Import' })
    },
    [buffer],
  )
  const measurePlugin = useDrawing(drawingId, state => state.plugin.global[0])
  const pluginApi = useDrawing(drawingId, state => state.api.plugin)

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
