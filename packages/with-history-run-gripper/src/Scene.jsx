import * as THREE from 'three'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { BuerliGeometry } from '@buerli.io/react'
import { Resize, Center, Bounds } from '@react-three/drei'
import { useControls, folder } from 'leva'
import gripperOfb from './resources/GripperTemplate.ofb?raw'

const buerli = headless(history, 'ws://localhost:9091')

export function Scene(props) {
  const drawingId = buerli.useDrawingId()
  const { Width, Height, Distance, Taper } = useControls({
    gripper: folder({
      Width: { value: 60, min: 0, max: 100 },
      Height: { value: 170, min: 0, max: 200 },
      Distance: { value: 40, min: 0, max: 100 },
      Taper: { value: 50, min: 0, max: 100 },
    }),
  })

  const geometry = useRef()
  useEffect(() => {
    buerli.run(async (api, store) => {
      store.productId = (await api.load(gripperOfb, 'ofb'))[0]
    })
  }, [])

  useEffect(() => {
    buerli.run(async (api, store) => {
      await api.setExpressions({
        partId: store.productId,
        members: [
          { name: 'W', value: Width },
          { name: 'H', value: Height },
          { name: 'D', value: Distance },
          { name: 'W1', value: Taper },
        ],
      })
    })
  }, [Width, Height, Distance, Taper])

  useLayoutEffect(() => {
    geometry.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5, wireframe: true })
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
