import { Suspense, useState, useTransition, useDeferredValue } from 'react'
import { useFirstMountState } from 'react-use'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { useBuerliCadFacade } from '@buerli.io/react'
import { suspend } from 'suspend-react'
import debounce from 'lodash/debounce'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight decay={0} position={[-10, 5, -15]} angle={0.2} castShadow />
        <group position={[0, -1, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Center top>
              <Flange scale={0.015} rotation={[-Math.PI / 2, 0, 0]} />
            </Center>
          </Suspense>
          <ContactShadows blur={4} color="orange" />
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

// A useState that will debounce and set values via React pending transitions w/o blocking the UI
function usePendingState(key, start, initialState, config = {}) {
  const [value, setValue] = useState(initialState)
  const deferredValue = useDeferredValue(value)
  // useControls is a hook from the leva library, it creates GUI panels for key:value pairs
  useControls({ flange: folder({ [key]: { value: initialState, ...config, onChange: debounce(v => start(() => setValue(v)), 100) } }) })
  return deferredValue
}

export function Flange(props) {
  const { api: { v1: api }, facade } = useBuerliCadFacade("with-history-cache") // prettier-ignore
  const isFirstMount = useFirstMountState()
  const [hovered, hover] = useState(false)
  // For more details on useTransition look into: https://react.dev/reference/react/startTransition
  const [pending, start] = useTransition()

  const thickness = usePendingState('thickness', start, 30, { min: 30, max: 60, step: 10 })
  const upperCylDiam = usePendingState('upperCylDiam', start, 190, { min: 100, max: 200, step: 10 })
  const upperCylHoleDiam = usePendingState('upperCylHoleDiam', start, '@expr.upperCylDiam - @expr.thickness')
  const flangeHeight = usePendingState('flangeHeight', start, 110, { min: 100, max: 200, step: 10 })
  const baseCylDiam = usePendingState('baseCylDiam', start, '@expr.upperCylDiam + 4 * @expr.thickness')
  const holeOffset = usePendingState('holeOffset', start, '(@expr.upperCylDiam / 2) + @expr.thickness')
  const holes = usePendingState('holes', start, 4, { min: 1, max: 6, step: 1 })
  const holeAngle = usePendingState('holeAngle', start, 'C:PI * 2 / @expr.holes')
  const expressions = [
    { name: 'thickness', value: thickness },
    { name: 'upperCylDiam', value: upperCylDiam },
    { name: 'upperCylHoleDiam', value: upperCylHoleDiam },
    { name: 'flangeHeight', value: flangeHeight },
    { name: 'baseCylDiam', value: baseCylDiam },
    { name: 'holeOffset', value: holeOffset },
    { name: 'holes', value: holes },
    { name: 'holeAngle', value: holeAngle },
  ]

  // This block creates a flange and results in a part, it will only run once.
  const part = suspend(async () => {
    api.common.clear()
    // Initial create
    const rotation = { x: 0, y: 0, z: 0 }
    const offset = { x: 0, y: 0, z: 0 }
    const origin = { x: 0, y: 0, z: 0 }
    const zDir = { x: 0, y: 0, z: 1 }
    // Create Part
    const part = await api.part.create({ name: 'Flange' })
    await api.part.expression({ id: part, toCreate: expressions })
    // Create geometry
    const wcsCenter = await api.part.workCSys({ id: part, offset, rotation })
    const baseCyl = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: '@expr.baseCylDiam', height: '@expr.thickness' })
    const upperCyl = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: '@expr.upperCylDiam', height: '@expr.flangeHeight' })
    const flangeSolid1 = await api.part.boolean({ id: part, type: 'UNION', target: baseCyl, tools: [upperCyl] })

    const subCylFlange = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: '@expr.upperCylHoleDiam', height: '@expr.flangeHeight' }) // prettier-ignore
    const solid = await api.part.boolean({ id: part, type: 'SUBTRACTION', target: flangeSolid1, tools: [subCylFlange] }) // prettier-ignore

    const wcsHole1Bottom = await api.part.workCSys({ id: part, offset: '[0, @expr.upperCylDiam / 2 + @expr.thickness, 0]', rotation, name: 'WCSBoltHoleBottom', }) // prettier-ignore
    const subCylHole1 = await api.part.cylinder({ id: part, references: [wcsHole1Bottom], diameter: 30, height: 50, }) // prettier-ignore
    const waCenter = await api.part.workAxis({ id: part, position: origin, direction: zDir })
    const pattern = await api.part.circularPattern({ id: part, targets: [subCylHole1], references: [waCenter], angle: '@expr.holeAngle', count: '@expr.holes', merged: true }) // prettier-ignore
    await api.part.boolean({ id: part, type: 'SUBTRACTION', target: solid, tools: [pattern] })
    return part
  }, ['flange'])

  // In this block we use the part that was generated previously and change its expressions.
  const [geo] = suspend(async () => {
    // We only want to set the expressions after the first mount, otherwise we would incur extra overhead
    if (!isFirstMount) await api.part.updateExpression({ id: part, toUpdate: expressions })
    return await facade.createBufferGeometry(part)
  }, ['flange', part, thickness, upperCylDiam, upperCylHoleDiam, flangeHeight, baseCylDiam, holeOffset, holes, holeAngle])

  // The geometry can be now be attached to a mesh, which is under our full control.
  return (
    <mesh geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={pending ? 'gray' : hovered ? 'hotpink' : 'orange'} />
      {pending && <Status>Pending</Status>}
    </mesh>
  )
}
