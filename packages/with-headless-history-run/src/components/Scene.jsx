import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { Center, Resize, Bounds } from '@react-three/drei'
import { BuerliGeometry } from '@buerli.io/react'

export function Scene(props) {
  const geometry = useRef()

  useLayoutEffect(() => {
    if (geometry.current) {
      geometry.current.traverse((obj) => {
        obj.receiveShadow = obj.castShadow = true
        if (obj.type === 'Mesh') {
          obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
        }
      })
    }
  })

  return (
    <group {...props}>
      <Bounds fit observe>
        <Resize scale={2}>
          <Center top ref={geometry}>
            <BuerliGeometry suspend />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
