/* prompt:

under /packages create a new project called "with-solid-claude".
You will be using the buerli.io react api, you must study it here https://buerli.io/docs/api/react
Buerli is a wrapper around the ClassCAD API, for this project the solid part is very important, study it here: https://classcad.ch/docs/API/solid
All the projects under /packages use these, so you can inspect them, too.

Now for the project, i want you to read this tutorial: https://wiki.freecad.org/Whiffle%20Ball%20tutorial
And then create the whiffle ball using the solid api.

Kepp in mind: when you make slices they create two cuts. Make intelligent use of the keepBoth attribute.
*/

import { Suspense, useState, useTransition, useDeferredValue } from 'react'
import { useBuerliCadFacade } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

export default function App() {
  return (
    <>
      <Canvas shadows="percentage" orthographic camera={{ position: [10, 10, 0], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI / 4} />
        <spotLight decay={0} position={[10, 5, -15]} angle={0.2} castShadow />
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <WhiffleBall scale={0.035} />
            <AccumulativeShadows alphaTest={0.85} opacity={0.85} frames={40} scale={20}>
              <RandomizedLight radius={6} position={[-15, 10, -10]} bias={0.0001} />
            </AccumulativeShadows>
          </group>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function usePendingState(key, start, initialState, config = {}) {
  const [value, setValue] = useState(initialState)
  const deferredValue = useDeferredValue(value)
  useControls({ whiffleBall: folder({ [key]: { value: initialState, ...config, onChange: debounce(v => start(() => setValue(v)), 100) } }) })
  return deferredValue
}

function WhiffleBall(props) {
  const { api: { v1: api }, facade } = useBuerliCadFacade('with-solid-claude') // prettier-ignore
  const [pending, start] = useTransition()

  const outerSize = usePendingState('outerSize', start, 90, { min: 60, max: 120, step: 5 })
  const wallThickness = usePendingState('wallThickness', start, 5, { min: 2, max: 15, step: 1 })
  const holeDiameter = usePendingState('holeDiameter', start, 55, { min: 20, max: 70, step: 5 })
  const filletRadius = usePendingState('filletRadius', start, 1.5, { min: 0.5, max: 3, step: 0.5 })

  const geo = suspend(async () => {
    api.common.clear()
    const part = await api.part.create({ name: 'WhiffleBall' })
    const ei = await api.part.entityInjection({ id: part })

    const innerSize = outerSize - 2 * wallThickness
    const half = outerSize / 2
    const cylHeight = 2 * outerSize

    // Step 1: Create outer box (90x90x90 by default, centered at origin)
    const outer = await api.solid.box({ id: ei, length: outerSize, width: outerSize, height: outerSize })

    // Step 2: Create inner box and subtract to hollow out (5mm wall thickness)
    const inner = await api.solid.box({ id: ei, length: innerSize, width: innerSize, height: innerSize })
    await api.solid.subtraction({ id: ei, target: outer, tools: [inner] })

    // Step 3: Punch three perpendicular cylindrical holes (diameter 55mm by default)
    // Z-axis hole
    const cyl1 = await api.solid.cylinder({ id: ei, height: cylHeight, diameter: holeDiameter })
    await api.solid.subtraction({ id: ei, target: outer, tools: [cyl1] })
    // X-axis hole
    const cyl2 = await api.solid.cylinder({ id: ei, height: cylHeight, diameter: holeDiameter, rotation: [0, Math.PI / 2, 0] })
    await api.solid.subtraction({ id: ei, target: outer, tools: [cyl2] })
    // Y-axis hole
    const cyl3 = await api.solid.cylinder({ id: ei, height: cylHeight, diameter: holeDiameter, rotation: [Math.PI / 2, 0, 0] })
    await api.solid.subtraction({ id: ei, target: outer, tools: [cyl3] })

    // Step 4: Slice 8 corners off to give it a rounded, ball-like silhouette.
    // Normals are unit vectors pointing toward each corner: [-1/2, -1/2, -sqrt(2)/2] etc.
    // Using keepBoth: false so only the main body is kept, discarding corner offcuts.
    const s = outerSize / 90 // scale factor relative to reference dimensions
    const cz = 15.556 * s // z-offset of slice origin, scaled proportionally

    // Lower 4 corners
    await api.solid.slice({ id: ei, target: outer, originPos: [-half, -half, -cz], normal: [-0.5, -0.5, -0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [half, -half, -cz], normal: [0.5, -0.5, -0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [half, half, -cz], normal: [0.5, 0.5, -0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [-half, half, -cz], normal: [-0.5, 0.5, -0.707], keepBoth: false })

    // Upper 4 corners
    await api.solid.slice({ id: ei, target: outer, originPos: [-half, -half, cz], normal: [-0.5, -0.5, 0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [half, -half, cz], normal: [0.5, -0.5, 0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [half, half, cz], normal: [0.5, 0.5, 0.707], keepBoth: false })
    await api.solid.slice({ id: ei, target: outer, originPos: [-half, half, cz], normal: [-0.5, 0.5, 0.707], keepBoth: false })

    // Step 5: Fillet the 6 outward-facing circular cutout edges (2 per axis).
    // Query each edge by a point that lies on it: at the face plane (±half) and offset
    // by the hole radius in a perpendicular direction to land on the circular edge.
    const hR = holeDiameter / 2
    const { circles: circleEdges } = await api.part.getGeometryIds({
      id: part,
      circles: [
        { pos: [hR, 0, half] }, // Z-axis hole, top face (+Z)
        { pos: [hR, 0, -half] }, // Z-axis hole, bottom face (-Z)
        { pos: [half, hR, 0] }, // X-axis hole, right face (+X)
        { pos: [-half, hR, 0] }, // X-axis hole, left face (-X)
        { pos: [0, half, hR] }, // Y-axis hole, front face (+Y)
        { pos: [0, -half, hR] }, // Y-axis hole, back face (-Y)
      ],
    })
    if (circleEdges?.length) {
      await api.solid.fillet({ id: ei, geomIds: circleEdges, radius: filletRadius })
    }

    return (await facade.createBufferGeometry(part))[0]
  }, ['whiffle-ball', outerSize, wallThickness, holeDiameter, filletRadius])

  return (
    <Center top>
      <group {...props}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial metalness={0} color={pending ? 'gray' : 'orange'} roughness={0.5} />
        </mesh>
        {pending && <Status>Pending</Status>}
      </group>
    </Center>
  )
}
