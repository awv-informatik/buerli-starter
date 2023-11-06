import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { history, WorkCoordSystemType } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Html, Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Space } from 'antd'

const buerli = headless(history, 'ws://localhost:9091')

export default function App() {
  const drawingId = buerli.useDrawingId()

  const [clicked, click] = useState(false)
  const items = [
    {
      key: '1',
      type: 'group',
      label: 'Group title',
      children: [
        { key: '1-1', label: '1st menu item' },
        { key: '1-2', label: '2nd menu item' },
      ],
    },
    {
      key: '2',
      label: 'sub menu',
      children: [
        { key: '2-1', label: '3rd menu item' },
        { key: '2-2', label: '4th menu item' },
      ],
    },
    {
      key: '3',
      label: 'disabled sub menu',
      disabled: true,
      children: [
        { key: '3-1', label: '5d menu item' },
        { key: '3-2', label: '6th menu item' },
      ],
    },
  ]

  return (
    <>
      <Canvas
        eventSource={document.getElementById('root')}
        eventPrefix="client"
        shadows
        gl={{ antialias: false }}
        orthographic
        camera={{ position: [0, 2.5, 10], zoom: 100 }}>
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
      <Dropdown menu={{ items }} open>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            textAlign: 'center',
            lineHeight: '200px',
          }}
        />
      </Dropdown>
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
          <Center
            top
            ref={geometry}
            rotation={[0, -Math.PI / 4, 0]} /*onContextMenu={e => click(true)} onPointerMissed={() => click(false)}*/
          >
            <BuerliGeometry drawingId={drawingId} suspend selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
