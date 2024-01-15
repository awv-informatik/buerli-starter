import { history } from '@buerli.io/headless'
import { BuerliGeometry, headless } from '@buerli.io/react'
import { Bounds, Center, OrbitControls, Resize } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { useCallback, useState } from 'react'
import PipesTable from './components/Table'
import { PipeType, addPipe, editPipe, deletePipe, createInitialPipes } from './model/Pipes'

const buerli = headless(history, 'ws://localhost:9091')

const defaultData = [
  {
    key: '0',
    name: 'Default Pipe',
    type: PipeType.StraightPipe,
    length: 100,
    angle: undefined,
    radius: undefined,
    rotation: undefined,
  },
]

export default function PipesApp() {
  const [data, setData] = useState(defaultData)
  const drawingId = buerli.useDrawingId()
  const rootAsm = buerli.cache(api => createInitialPipes(api, defaultData), ['init'])
  const onEditPipe = useCallback(item => buerli.run(api => editPipe(api, item, rootAsm)), [buerli])
  const onAddPipe = useCallback(item => buerli.run(api => addPipe(api, item, rootAsm)), [buerli])
  const onDeletePipe = useCallback(() => buerli.run(api => deletePipe(api)), [buerli])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PipesTable data={data} onSetData={setData} onEditPipe={onEditPipe} onAddPipe={onAddPipe} onDeletePipe={onDeletePipe} />
      <Canvas
        shadows
        orthographic
        style={{ flex: 1 }}
        gl={{ antialias: false }}
        camera={{ position: [10, 10, 10], up: [0, 0, 1], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
        <Bounds fit observe>
          <Resize>
            <Center rotation={[0, 0, Math.PI / 2]}>
              <BuerliGeometry drawingId={drawingId} suspend selection />
            </Center>
          </Resize>
        </Bounds>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
