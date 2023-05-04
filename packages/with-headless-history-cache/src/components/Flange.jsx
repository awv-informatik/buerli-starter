import { useState, useTransition } from 'react'
import { useFirstMountState } from 'react-use'
import { BooleanOperationType, WorkAxisType, WorkCoordSystemType } from '@buerli.io/classcad'
import { useControls } from 'leva'
import debounce from 'lodash/debounce'
import { Status } from './Pending'

// A useState that will debounce and set values via React pending transition w/o blocking the UI
function usePendingState(key, start, initialState, config = {}) {
  const [value, setValue] = useState(initialState)
  // useControls is a hook from the leva library, it creates GUI panels for key:value pairs
  useControls({ [key]: { value, ...config, onChange: debounce(v => start(() => setValue(v)), 100) } })
  return value
}

export function Flange({ buerli, ...props }) {
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

  // This block creates a flange and results in a part, it will only run once.
  const part = buerli.cache(
    async api => {
      const part = api.createPart('flange')
      api.createExpressions(part, ...expressions)
      const wcsCenter = api.createWorkCoordSystem(part, WorkCoordSystemType.WCS_CUSTOM, [], [], [0, 0, 0], [0, 0, 0])
      const baseCyl = api.cylinder(part, [wcsCenter], 'ExpressionSet.baseCylDiam', 'ExpressionSet.thickness')
      const upperCyl = api.cylinder(part, [wcsCenter], 'ExpressionSet.upperCylDiam', 'ExpressionSet.flangeHeight')
      const flangeSolid1 = api.boolean(part, BooleanOperationType.UNION, [baseCyl, upperCyl])
      const subCylFlange = api.cylinder(part, [wcsCenter], 'ExpressionSet.upperCylHoleDiam', 'ExpressionSet.flangeHeight')
      const solid = api.boolean(part, BooleanOperationType.SUBTRACTION, [flangeSolid1, subCylFlange])
      const wcsHole1Bottom = api.createWorkCoordSystem(part, WorkCoordSystemType.WCS_CUSTOM, [], [], [0, upperCylDiam / 2 + thickness, 0], [0, 0, 0])
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
