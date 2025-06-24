import { Suspense, useState, useTransition } from 'react'
import { useFirstMountState } from 'react-use'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'
//import { BooleanOperationType, WorkAxisType, WorkCoordSystemType } from '@buerli.io/headless'

import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, ScgGraphicType } from '@buerli.io/classcad'
import { suspend } from 'suspend-react'
import debounce from 'lodash/debounce'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRsancyK29wTEN0VkJZUm1rRjlRbEZuWTV4T0dCMEFYRTNXdXV1RjE5SVlzY20vTU9md2gvNDJEUEFUSmM1YzVQVTZoTFc3QTJOUDZMbFh4bVNsZjRvdjdEcFNHdzhqVDI2bDZzYTVzVWVBaThacGUvS2dsTzRWSXpPSk92Uk5VcG5aSjhyd0RLOGZnRHNYcngrQms1RnFGcGZxOWtGY1VjNHVFajJQQmg1b0dteGZ6N0lZUWw3MzhIUm9LdTk4ZXJJU1JSUnVVRmxESkFpVEJhdEh5NXgzdTMwaVJ2eFQ3NGgzaXhxYWpuQUFNNE1WNEljdTl1OUV3UlFaVlFWKzhkN3FoVlIyZkl4Wk5TNEdwR2pQamNuN1lUUEErZWFHR3ZtYVlTU2RJNURkKzlKWTVSQ2RYTFJOQjFqenRWaEV6bjB4Y0pCQXFVQjc5bzMxWFYvK3dHcWYzUGFnUHVCVEx3TGhrNnFDNnhqamI5SHEvUk9zMnI5b2RIbHI5TlNCcE14TmZtQ2gwUEdBQ3ZKUENtSDJDT3FUSmJiS1NhSXJxTFR0S1pnQS9vbHc0T1V3VEVUcDhhWnpMdTNqay92SUhuZmhqa1I0MEo1S2VLQlNqSjJoTExpUnBiSFFML3B2WDB3VmY2b25Idm95VDZmdlIrc0tld3NYUXpQVWhNWWVSL3dNVE1vb0dObEc3bkQ1WFpkMXFzMDlES2VUOTdxTmtFVEdTS3VBQXBMWVJmUFd0TGNNb3VDUnAvMWlkNDZvZjBFbk9sT3VLV2JTUVM2MTBFL0lySVN3Z3liL0tmaFBlVk4zcmVZV3VQcDdwanFDck9GUTZCYnFKRWErQkpqKzQ4bGJsUGhQSnM5cWxVQmFpakJTa0s2c2sxMExQK1I1ZWc5clFZN3ZqMjVNSGZSUHhUNEMwZ0R4empnalNQYmJrL3NGcjVOT25qb3dLWWtsSWU5VzVQU1Evb2FUUEkyOXJFcFRJOFBtR2pGUW5ac29rTzM1NEVoQlFtUldtRTZYUlFJZjMrRHo1QmdMelpGTDBlS3ZjOVoyNU8va3EvSWRjVVJ2OVpMcG4rVEtxa2oxbXVpTkFlUkdnYS8yU09Oa1dMZU5WZGZUWDR3VUIwZng0ZXpnRnVPL0FFMlJtNDhSK1Izd251cDFzeTE1U2ROSWhJdVQxMG52dTdsamVKekFYa3FwalE2ZUNNVzBHN2NLQU1COXZoenBIMnVqZDhiN2tTZWFtWThUS21yV1JabkJiTXhHaEUvNnVPUFdpRVNiVUtnSlhFbHN1b1Y4MXduNGpqbDBKVjhQKzdONzNMK2lCSk9YZzNnOVo0bXdySGp5NlF1RXFyU2x3TTZ5N2xDeHcwV1JPbGF5SU1TKzg1cFhXNmN2cGh0UFI2ZldVWnczY285QVhWOG5qOTNTSEhzdzNVa3VMRDJMVXJqbERkaU0rT0JWZ2ZDaVQ0dzFyYlFPWWpDejBvYm9TSHBoTm9nWCtRZzVOY1lKa0lodWxhNWp0dWFkdzBydWJsVC8vQ0xmQTFBNHgyNTliNWRaUG93eUMzU2NWOTl3NWhjSjVjUTl3ay9DWkVCVk1ZWDYyVGVnM3VuNTdMZHZzWUN3YXVGSUozTjBnZWc4aFlId1VoWFAzL1BqeDV4Q3FVa2dTNXFhbm42bW9XdENVQzBCQWtuN2s1R25kSDhNYUZBdW5IanZRWEZJVld1ZVhGYnBSa1ZXbU0xaXJGM1V5ZDJxaUUxaDFrTjhVTzlmbEJpd1RNa0Fab1N4aDd0elhGdlI2NlJiSU4vWXQybXluT1piR2RlTDU2YzgyRE5pTm1obG5rNERjMnVtMXNlcVpPMWswVThlNUVNM3ZIOWlveEFacEFkUnp4K090VjhLTHVPNlMxbGNvazBYMUlRRE1oZFkvOW9UK0dFbmRrZjRWWHlCNWRaNlpKOXYyc0M0RDFvRm1heG00ZTN1MTE3Zm9vdkc2TDFQMEo3b2xNNW89'
init(did => new WASMClient(did, { appKey }))

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
  // useControls is a hook from the leva library, it creates GUI panels for key:value pairs
  useControls({ flange: folder({ [key]: { value, ...config, onChange: debounce(v => start(() => setValue(v)), 100) } }) })
  return value
}

export function Flange(props) {
  const { api: { v1: api } } = useClassCAD() // prettier-ignore
  const isFirstMount = useFirstMountState()
  const [hovered, hover] = useState(false)
  // For more details on useTransition look into: https://react.dev/reference/react/startTransition
  const [pending, start] = useTransition()

  const thickness = usePendingState('thickness', start, 30, { min: 30, max: 60, step: 10 })
  const upperCylDiam = usePendingState('upperCylDiam', start, 190, { min: 100, max: 200, step: 10 })
  const upperCylHoleDiam = usePendingState('upperCylHoleDiam', start, 'upperCylDiam - thickness')
  const flangeHeight = usePendingState('flangeHeight', start, 110, { min: 100, max: 200, step: 10 })
  const baseCylDiam = usePendingState('baseCylDiam', start, 'upperCylDiam + 4 * thickness')
  const holeOffset = usePendingState('holeOffset', start, '(upperCylDiam / 2) + thickness')
  const holes = usePendingState('holes', start, 4, { min: 1, max: 6, step: 1 })
  const holeAngle = usePendingState('holeAngle', start, 'C:PI * 2 / holes')
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

  const part1 = suspend(async () => {
    api.common.clear()
    const { result: part } = await api.part.create({ name: 'Part' })
    const { result: ei } = await api.part.entityInjection({ id: part })
    const { result: ccShape } = await api.curve.shape({ id: ei })

    await api.part.expression({ id: part, toCreate: expressions })
    const { result: wcsCenter } = await api.part.workCSys({ id: part })
    const { result: baseCyl } = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: 'ExpressionSet.baseCylDiam', height })
    const { result: upperCyl } = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: 'ExpressionSet.upperCylDiam', height: 'ExpressionSet.flangeHeight' })
    const { result: flangeSolid1 } = await api.part.boolean({ id: part, operation: 'UNION', target: baseCyl, tools: [upperCyl] })
    const { result: subCylFlange } = await api.part.cylinder({ id: part, references: [wcsCenter], diameter: 'ExpressionSet.upperCylHoleDiam', height: 'ExpressionSet.flangeHeight' })
    const { result: solid } = await api.part.boolean({
      id: part,
      operation: 'SUBTRACTION',
      solids: [flangeSolid1, subCylFlange],
    })
    const { result: wcsHole1Bottom } = await api.part.workCSys({
      id: part,
      type: 'WCS_CUSTOM',
      references: [],
      position: [0, upperCylDiam / 2 + thickness, 0],
      rotation: [0, 0, 0],
    })
    const { result: subCylHole1 } = await api.part.cylinder({
      id: part,
      references: [wcsHole1Bottom],
      diameter: 30,
      height: 50,
    })
    const { result: waCenter } = await api.part.workAxis({
      id: part,
      type: 'WA_FIXED',
      references: [],
      position: [0, 0, 0],
      direction: [0, 0, 1],
    })
    const { result: pattern } = await api.part.circularPattern({
      id: part,
      solids: [subCylHole1],
      workAxes: [waCenter],
      options: {
        inverted: 0,
        angle: 'ExpressionSet.holeAngle',
        count: 'ExpressionSet.holes',
        merged: 1,
      },
    })
    await api.part.boolean({
      id: part,
      operation: 'SUBTRACTION',
      solids: [solid, pattern],
    })
    return part
  })

  // This block creates a flange and results in a part, it will only run once.
  const part = buerli.cache(
    async api => {
      const part = api.createPart('flange')
      api.createExpressions(part, ...expressions)

      const wcsCenter = api.createWorkCoordSystem(part, WorkCoordSystemType.WCS_CUSTOM, [], [0, 0, 0], [0, 0, 0])
      const baseCyl = api.cylinder(part, [wcsCenter], 'ExpressionSet.baseCylDiam', 'ExpressionSet.thickness')
      const upperCyl = api.cylinder(part, [wcsCenter], 'ExpressionSet.upperCylDiam', 'ExpressionSet.flangeHeight')
      const flangeSolid1 = api.boolean(part, BooleanOperationType.UNION, [baseCyl, upperCyl])
      const subCylFlange = api.cylinder(part, [wcsCenter], 'ExpressionSet.upperCylHoleDiam', 'ExpressionSet.flangeHeight')
      const solid = api.boolean(part, BooleanOperationType.SUBTRACTION, [flangeSolid1, subCylFlange])
      const wcsHole1Bottom = api.createWorkCoordSystem(
        part,
        WorkCoordSystemType.WCS_CUSTOM,
        [],
        [0, upperCylDiam / 2 + thickness, 0],
        [0, 0, 0],
      )
      const subCylHole1 = api.cylinder(part, [wcsHole1Bottom], 30, 50)
      const waCenter = api.createWorkAxis(part, WorkAxisType.WA_FIXED, [], [0, 0, 0], [0, 0, 1])
      const pattern = api.circularPattern(part, [subCylHole1], [waCenter], {
        inverted: 0,
        angle: 'ExpressionSet.holeAngle',
        count: 'ExpressionSet.holes',
        merged: 1,
      })
      await api.boolean(part, BooleanOperationType.SUBTRACTION, [solid, pattern])
      return part
    },
    ['flange'],
  )

  // In this block we use the part that was generated previously and change its expressions.
  const [geo] = buerli.cache(
    async api => {
      // We only want to set the expressions after the first mount, otherwise we would incur extra overhead
      if (!isFirstMount) api.setExpressions({ partId: part, members: expressions })
      return await api.createBufferGeometry(part)
    },
    ['flange', part, thickness, upperCylDiam, upperCylHoleDiam, flangeHeight, baseCylDiam, holeOffset, holes, holeAngle],
  )

  // The geometry can be now be attached to a mesh, which is under our full control.
  return (
    <mesh geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={pending ? 'gray' : hovered ? 'hotpink' : 'orange'} />
      {pending && <Status>Pending</Status>}
    </mesh>
  )
}
