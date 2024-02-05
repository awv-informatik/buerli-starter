import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { history, EdgeTypes, ChamferType, WorkCoordSystemType } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

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
