import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useBuerliCadFacade } from '@buerli.io/react'
import { ScgGraphicType } from '@buerli.io/classcad'
import { Canvas, useThree } from '@react-three/fiber'
import { Resize, Center, Bounds, OrbitControls, Environment } from '@react-three/drei'
import { Status } from './Pending'

export default function App() {
  return (
    <Canvas orthographic camera={{ position: [15, 15, 15], zoom: 50 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={Math.PI * 0.5} />
      <directionalLight position={[-10, 10, 5]} intensity={Math.PI} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      <Suspense fallback={<Status>Loading</Status>}>
        <WhiffleBall />
      </Suspense>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      <Environment preset="city" />
    </Canvas>
  )
}

function WhiffleBall(props) {
  const { scene } = useThree()
  const { api: { v1: api }, facade, Geometry } = useBuerliCadFacade('with-claude') // prettier-ignore
  const geometry = useRef()

  useEffect(() => {
    async function createWhiffleBall() {
      // Clear any previous geometry
      api.common.clear()
      // Create a new part
      const part = await api.part.create({ name: 'WhiffleBall' })
      // Create entity injection to work with solids
      const ei = await api.part.entityInjection({ id: part })

      // Dimensions from FreeCAD tutorial
      const outerSize = 90
      const innerSize = 80
      const holeRadius = 27.5
      const holeDiameter = 2 * holeRadius // 55mm
      const holeHeight = 120

      // Step 1: Create outer box (90x90x90) centered at origin
      const outerBox = await api.solid.box({ id: ei, length: outerSize, width: outerSize, height: outerSize })
      // Step 2: Create inner box (80x80x80) to make it hollow
      const innerBox = await api.solid.box({ id: ei, length: innerSize, width: innerSize, height: innerSize })
      // Step 3: Subtract inner from outer to create hollow shell
      await api.solid.subtraction({ id: ei, target: outerBox, tools: [innerBox] })
      // Step 4: Create three perpendicular cylinders for holes
      // Cylinder 1: along Z-axis (vertical)
      const cyl1 = await api.solid.cylinder({ id: ei, height: holeHeight, diameter: holeDiameter })
      // Cylinder 2: along X-axis
      const cyl2 = await api.solid.cylinder({ id: ei, height: holeHeight, diameter: holeDiameter, rotation: [0, Math.PI / 2, 0] })
      // Cylinder 3: along Y-axis
      const cyl3 = await api.solid.cylinder({ id: ei, height: holeHeight, diameter: holeDiameter, rotation: [Math.PI / 2, 0, 0] })
      // Subtract cylinders to create holes
      await api.solid.subtraction({ id: ei, target: outerBox, tools: [cyl1, cyl2, cyl3] })
      // Step 5: Slice corners to make it spherical
      // The slice positions create a sphere-like shape from the cube
      // Using 8 corner slices (4 bottom + 4 top)
      const cornerDist = 45 // Half of outer box size
      const sliceHeight = 15.556 // Calculated to create spherical shape

      // Bottom corners
      await api.solid.slice({ id: ei, target: outerBox, originPos: [-cornerDist, -cornerDist, -sliceHeight], normal: [-0.5, -0.5, -0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [cornerDist, -cornerDist, -sliceHeight], normal: [0.5, -0.5, -0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [cornerDist, cornerDist, -sliceHeight], normal: [0.5, 0.5, -0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [-cornerDist, cornerDist, -sliceHeight], normal: [-0.5, 0.5, -0.707], keepBoth: false })
      // Top corners
      await api.solid.slice({ id: ei, target: outerBox, originPos: [-cornerDist, -cornerDist, sliceHeight], normal: [-0.5, -0.5, 0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [cornerDist, -cornerDist, sliceHeight], normal: [0.5, -0.5, 0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [cornerDist, cornerDist, sliceHeight], normal: [0.5, 0.5, 0.707], keepBoth: false })
      await api.solid.slice({ id: ei, target: outerBox, originPos: [-cornerDist, cornerDist, sliceHeight], normal: [-0.5, 0.5, 0.707], keepBoth: false })

      // Step 6: Add fillets to the edges around the holes
      // Get circular edges around the three cylindrical holes
      const radius = holeRadius

      // Edges of hole along Z-axis (top and bottom circles)
      const { circles: zHoleEdges } = await api.part.getGeometryIds({
        id: part,
        circles: [
          { pos: [radius, 0, outerSize / 2] },
          { pos: [-radius, 0, outerSize / 2] },
          { pos: [0, radius, outerSize / 2] },
          { pos: [0, -radius, outerSize / 2] },
          { pos: [radius, 0, -outerSize / 2] },
          { pos: [-radius, 0, -outerSize / 2] },
          { pos: [0, radius, -outerSize / 2] },
          { pos: [0, -radius, -outerSize / 2] },
        ],
      })

      // Edges of hole along X-axis
      const { circles: xHoleEdges } = await api.part.getGeometryIds({
        id: part,
        circles: [
          { pos: [outerSize / 2, radius, 0] },
          { pos: [outerSize / 2, -radius, 0] },
          { pos: [outerSize / 2, 0, radius] },
          { pos: [outerSize / 2, 0, -radius] },
          { pos: [-outerSize / 2, radius, 0] },
          { pos: [-outerSize / 2, -radius, 0] },
          { pos: [-outerSize / 2, 0, radius] },
          { pos: [-outerSize / 2, 0, -radius] },
        ],
      })

      // Edges of hole along Y-axis
      const { circles: yHoleEdges } = await api.part.getGeometryIds({
        id: part,
        circles: [
          { pos: [radius, outerSize / 2, 0] },
          { pos: [-radius, outerSize / 2, 0] },
          { pos: [0, outerSize / 2, radius] },
          { pos: [0, outerSize / 2, -radius] },
          { pos: [radius, -outerSize / 2, 0] },
          { pos: [-radius, -outerSize / 2, 0] },
          { pos: [0, -outerSize / 2, radius] },
          { pos: [0, -outerSize / 2, -radius] },
        ],
      })

      // Apply fillets to circular edges around the holes
      const circleEdges = [...zHoleEdges, ...xHoleEdges, ...yHoleEdges]
      if (circleEdges.length > 0) await api.solid.fillet({ id: ei, geomIds: circleEdges, radius: 1 })

      // Interactive selection: Let user select additional edges to fillet
      console.log('Select edges to fillet (press ESC when done)')
      const selectedEdges = await facade.selectGeometry([ScgGraphicType.LINE], 3)
      const edgeIds = selectedEdges.map(sel => sel.graphicId)

      if (edgeIds.length > 0) {
        console.log(`Filleting ${edgeIds.length} selected edges`)
        await api.solid.fillet({ id: ei, geomIds: edgeIds, radius: 2 })
      }
    }

    createWhiffleBall()
  }, [api, facade])

  return (
    <group {...props}>
      <Bounds fit observe margin={2}>
        <Resize scale={1.5}>
          <Center ref={geometry}>
            <Geometry selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
