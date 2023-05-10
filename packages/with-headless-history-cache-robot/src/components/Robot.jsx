import { useState, useRef, useTransition } from 'react'
import { useFrame } from '@react-three/fiber'
import { history } from '@buerli.io/headless'
//import { headless, useBuerli } from '@buerli.io/react'
import { useControls } from 'leva'
import debounce from 'lodash/debounce'
import { easing } from 'maath'
import robotArm from '../resources/Robot6Axis.ofb?raw'
import { headless } from '../util/headless'
import { createScene } from '../util/createScene'
import { Status } from './Pending'

const buerli = headless(history, 'ws://localhost:9091')

function useAxis(asm, key, config = { value: 0 }, start) {
  // Create state value
  const [value, setValue] = useState(config.value)
  // Tie it to leva GUI panel
  useControls({ [key]: { value, ...config, onChange: debounce(v => start(() => setValue(v)), 40) } })
  // On change update the constraint value
  return buerli.cache(
    async api => {
      const { constrId } = await api.getRevoluteConstraint(asm, key)
      const constrValue = { constrId: constrId, paramName: 'zRotationValue', value: (value / 180) * Math.PI }
      await api.update3dConstraintValues(constrValue)
      return value
    },
    ['robot-axis', key, value],
  )
}

export function Robot(props) {
  // 1. Create scene, return scene nodes
  const [asm, nodes, drawingId] = buerli.cache(
    async api => {
      const drawing = buerli.instance.drawingId
      const [asm] = await api.load(robotArm, 'ofb')
      const { nodes } = await createScene(drawing, asm)
      return [asm, nodes, drawing]
    },
    ['robot'],
  )

  // 2. Hold axis values in state, update them on change, useTransition creates pending state
  const [pending, start] = useTransition()
  const a1 = useAxis(asm, 'Base-J1', { value: 0, step: 5, min: 0, max: 360 }, start)
  const a2 = useAxis(asm, 'J1-J2', { value: 0, step: 1, min: -60, max: 160 }, start)
  const a3 = useAxis(asm, 'J2-J3', { value: 0, step: 1, min: -230, max: 45 }, start)
  const a4 = useAxis(asm, 'J3-J4', { value: 0, step: 1, min: -180, max: 180 }, start)
  const a5 = useAxis(asm, 'J4-J5', { value: 0, step: 1, min: -90, max: 90 }, start)
  const a6 = useAxis(asm, 'J5-J6', { value: 0, step: 1, min: -180, max: 180 }, start)

  // 3. Create a structure-only scene whenever values change
  const { nodes: structure } = buerli.cache(api => createScene(drawingId, asm, { structureOnly: true }), ['robot-struct', a1, a2, a3, a4, a5, a6])

  // 4. useFrame to update the position and rotations of the nodes
  const ref = useRef()
  useFrame((state, delta) => {
    for (let i = 0; i < 7; i++) {
      easing.damp3(ref.current.children[i].position, structure[`NAUO${i + 1}`].position, 0.1, delta)
      easing.dampQ(ref.current.children[i].quaternion, structure[`NAUO${i + 1}`].quaternion, 0.1, delta)
    }
  })

  // 5. The view is declarative, it just needs to hold the initial geometries
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes['J3 C3'].geometry} material={nodes['J3 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J1 C3'].geometry} material={nodes['J1 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J5 C3'].geometry} material={nodes['J5 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J4 C3'].geometry} material={nodes['J4 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J6 C3'].geometry} material={nodes['J6 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['J2 C3'].geometry} material={nodes['J2 C3'].material} />
      <mesh castShadow receiveShadow geometry={nodes['Base C3,S'].geometry} material={nodes['Base C3,S'].material} />
      {pending && <Status>Pending</Status>}
    </group>
  )
}
