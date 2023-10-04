import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { solid } from '@buerli.io/headless'
import { BuerliGeometry, headless } from '@buerli.io/react'
import { ccAPI } from '@buerli.io/classcad'
import { api } from '@buerli.io/core'
import { toast } from 'react-hot-toast'

// Create a headless history socket
const { cache, useDrawingId } = headless(solid, 'ws://localhost:9091')

export function Model({ buffer, ...props }) {
  const drawingId = useDrawingId()
  const ref = useRef()
  cache(
    async api => {
      ccAPI.common.setFacetingParameters(drawingId, 0.1, 0)
      const importIds = await api.import(buffer)
    },
    ['pipes', buffer],
  )
  
  useLayoutEffect(() => {
    ref.current.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({ color: new THREE.Color('white'), roughness: 0.1, metalness: 1 })
        obj.castShadow = obj.receiveShadow = true
      }
    })

    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const state = api.getState()
    const containers = Object.values(state.drawing.refs[drawingId].graphic.containers)
    containers.forEach(container => {
      const surfaces = container.meshes.map(mesh => mesh.properties.surface)
      const cylinders = surfaces.filter(surface => surface.type === 'cylinder')
      const tubes = cylinders.reduce((prev, cur) => {
        if (!prev.some(el => a.fromArray(el.origin).equals(b.fromArray(cur.origin)))) prev.push(cur)
        return prev
      }, [])
      // Calculate length
      const totalHeight = tubes.reduce((prev, cur) => prev + cur.height, 0)
      console.log(totalHeight)

      toast.success(`Total length = ${totalHeight.toFixed(2)}cm`, { duration: Infinity })
    })
  }, [])
  return (
    <group ref={ref} {...props}>
      <BuerliGeometry drawingId={drawingId} suspend />
    </group>
  )
}
