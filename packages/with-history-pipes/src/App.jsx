import * as THREE from 'three'
import { useRef, useCallback, useState, Suspense, useLayoutEffect } from 'react'
import { History } from '@buerli.io/headless'
import { BuerliGeometry, useHeadless } from '@buerli.io/react'
import {
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  Bounds,
  Center,
  OrbitControls,
  Resize,
  GizmoHelper,
  GizmoViewport,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Tabs } from 'antd'
import PipesTable from './components/Table'
import { PipeType, Pipes } from './model/Pipes'

const defaultData = [
  { key: '0', name: 'Default', type: PipeType.StraightPipe, length: 100, angle: undefined, radius: undefined, rotation: undefined },
]

export default function App() {
  const [activeKey, setActiveKey] = useState()
  const [items, setItems] = useState([])
  const newTabIndex = useRef(0)
  const onChange = newActiveKey => setActiveKey(newActiveKey)
  const onEdit = (targetKey, action) => (action === 'add' ? add() : remove(targetKey))
  const add = () => {
    const key = `newTab${newTabIndex.current++}`
    setItems([ ...items, { label: 'New session', children: <Suspense fallback={null}><Tab id={key} /></Suspense>, key }]) // prettier-ignore
    setActiveKey(key)
  }
  const remove = targetKey => {
    let newActiveKey = activeKey
    let lastIndex = -1
    items.forEach((item, i) => item.key === targetKey && (lastIndex = i - 1))
    const newPanes = items.filter(item => item.key !== targetKey)
    if (newPanes.length && newActiveKey === targetKey) newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key
    setItems(newPanes)
    setActiveKey(newActiveKey)
  }
  return <Tabs type="editable-card" onChange={onChange} activeKey={activeKey} onEdit={onEdit} items={items} />
}

function Tab({ id }) {
  const buerli = useHeadless(History, `ws://localhost:9091?session=${id}`)
  const [data, setData] = useState(defaultData)
  const drawingId = buerli.useDrawingId()
  const pipes = buerli.cache(api => new Pipes().init(api, defaultData), ['init', id])
  const onEditPipe = useCallback(item => buerli.run(api => pipes.edit(item)), [buerli])
  const onAddPipe = useCallback(item => buerli.run(api => pipes.add(item)), [buerli])
  const onDeletePipe = useCallback(() => buerli.run(api => pipes.delete()), [buerli])
  buerli.api.then(api => (window.b = api.getDrawing()))
  return (
    <div style={{ display: 'flex', flexDirection: 'rows', height: '100%', gap: 20 }}>
      <PipesTable data={data} onSetData={setData} onEditPipe={onEditPipe} onAddPipe={onAddPipe} onDeletePipe={onDeletePipe} />
      <div style={{ overflow: 'hidden', flex: 'auto', height: '100%', width: '100%', borderRadius: 8, background: '#fafafa' }}>
        <Canvas shadows flat orthographic gl={{ antialias: false }} camera={{ position: [10, 10, 10], zoom: 100 }}>
          <ambientLight intensity={0.5 * Math.PI} />
          <Suspense fallback={null}>
            <Bounds fit observe>
              <Resize>
                <Center top>
                  <View drawingId={drawingId} />
                </Center>
              </Resize>
            </Bounds>
            <AccumulativeShadows color="black" frames={100} temporal alphaTest={0.65} opacity={0.75}>
              <RandomizedLight radius={6} position={[2, 5, -20]} />
            </AccumulativeShadows>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
          <GizmoHelper renderPriority={1} alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport />
          </GizmoHelper>
        </Canvas>
      </div>
    </div>
  )
}

const steel = new THREE.MeshStandardMaterial({ color: '#ddd', roughness: 0.15, metalness: 0.75 })

function View({ drawingId }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current.traverse(child => {
      if (child.isMesh) {
        child.receiveShadow = child.castShadow = true
        child.material = steel
      }
    })
  })
  return (
    <group ref={ref}>
      <BuerliGeometry drawingId={drawingId} suspend selection />
    </group>
  )
}
