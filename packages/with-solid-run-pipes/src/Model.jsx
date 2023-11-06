import * as THREE from 'three'
import { useLayoutEffect, useRef, useState } from 'react'
import { solid } from '@buerli.io/headless'
import { BuerliGeometry, headless } from '@buerli.io/react'
import { ccAPI } from '@buerli.io/classcad'
import { api } from '@buerli.io/core'
import { toast } from 'react-hot-toast'

import { Html, CameraControls, useCursor } from '@react-three/drei'
import { Menu } from 'antd'
import { BorderOutlined, UpCircleOutlined, ExpandOutlined, SettingOutlined } from '@ant-design/icons'

const item = (label, icon, children, type) => ({ key: label, icon, children, label, type })
const Color = ({ background = 'orange ' }) => (
  <div style={{ display: 'inline-block', width: 14, height: 14, marginRight: 10, borderRadius: 4, background }} />
)
const items = [
  item('Navigation Three', <SettingOutlined />, [
    item('Option 9'),
    item('Option 10'),
    item('Submenu', null, [item('Option 7'), item('Option 8')]),
  ]),
]

// Create a headless history socket
const { cache, useDrawingId } = headless(solid, 'ws://localhost:9091')

export function Model({ buffer, ...props }) {
  const html = useRef()  
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useCursor(hovered)

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
    <group
      ref={ref}
      onPointerMissed={() => click(false)}
      onContextMenu={event => {
        event.stopPropagation()
        html.current.position.copy(event.point)
        click(event.object)
      }}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <BuerliGeometry drawingId={drawingId} suspend />
      <group ref={html}>
        <Html>
          <Menu
            defaultSelectedKeys={['Orange', 'boxGeometry']}
            onClick={e => {
              console.log(clicked?.userData)
            }}
            style={{ width: 256, display: clicked ? 'block' : 'none' }}
            mode="vertical"
            items={items}
          />
        </Html>
      </group>
    </group>
  )
}
