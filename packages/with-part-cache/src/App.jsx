import { Suspense, useState, useTransition, useDeferredValue } from 'react'
import { useFirstMountState } from 'react-use'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'

import { useBuerliCadFacade } from '@buerli.io/react'
import { init, WASMClient } from '@buerli.io/classcad'
import { suspend } from 'suspend-react'
import debounce from 'lodash/debounce'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRpdzIrR0d0N0JIZWk1VEhwK2xHZDJpRHhFOEJBQkEwUEFpSzd6ZXpmM0lCZzB2cklka0xkWHFQdzlzenZxTHlDUkM1N1A0MEFaQnNiSlZ4aFRGNjg2WEdkd1c0Wis0b0l1V2NXNU83ZUh6MktnTTY0Mzh3Wk4rWVlIaVBMS2sxTTFLZ2d5SUxpZGdXLzUzSXFRZks5ZkNUZk9KcjRoU3VnWUJiUGpyVzdqZkJ3cE96RGhlZWpaOHl2NkNkU3orSzlnMmJQa0xaa240akV1aDBJM0tzVUhMSmt2b1Y0dStJN2EvdUw3RHd2bUFkK29yRGdXZHFaeXpjTmlUTGltSlFFZDVsMm02L1lKN0hnOFlFeDhXaXZMVW5TZHpGaEM2UVllSGorS2lYaXdPbDZMVS95ZjEyOVNud09kbXNrRU5QbjJkSVRoTTgxL21MR0V0ajlGcytTLy9JaUs4aWhwaDBIMUsreVkwU3h5b1BmNU5veU9aRks4a1RidGRYMmNlekVpRFhhSmZ5OG9GOEtYNFpDOUxyc3F3WHdLaEdxejRtUnk5Q0pMRnBJamtCZ3FubUNzM0hMS3cvdmZwSXlndzFITXB2TU1aemc4RUY1ZDZlQkRKYS9BemJNWWVLTzFSZzNldlBrNkFGNXZLSmxIbldHYzhaazQ0MktaMXZsdzZVazM0SzdtUmVwdURNYXBURHY3Q3lOM1NkVDZ3eC9TR25NSEhydmJXUkFheG50MlhFVEpycFFIQ3RVTUhlOENidVBMeHpKUTY5NERoOVJOWTFhMFlRQnh1U0dKaU1pVUtmSjZzUUxVT2FUQ1VTNkR4YXpIM293cXcwbndpbSs0Nk1MTVlpcG4rMG9rT1NIZUc1b29JZkFteVpLaDdyVlErTUpwUW5SY0NqVXhXencyRUlCbWNaYjFmNnY1QndRWERsSWx6Nmc0VWw5Vlg1N0JscUYyMVovZy9TdjdBSE1rcGNLSWhvWHFDcWxWUkFqS1lLUmlaVHVOQk1OQnZqQllQNVVYUVVVNktFTUJLcTM1ZDA1TDk0YStSeE5rUGl5bVlhL0FpZmxwUDVFZTRXLzdKWkFqOXcrWnBYVmI5R3IrRkNPd3RDcCtDcmkzOEpDSlpQVCt4SEFnckhtcjFNc2FsVjFFbjVQdldaZ0k0ZXlVNDNmUHA3dE9rSE51UkpETjVTYXBrek1VNFNGbER2V3M2emhRY05CVGhuOW5EVmdBZ3V6eUJPN2wwK3lraytFZUFncXQzZXFEa1hkNDlqbGNEL1BEVUNYdVA0ZWRFT0VFWWxMb2w1V1o0ZDZjUlVTQ1VwdFJJWlN6dVRGc1ZPNGNTV08yRWdaaVV3MVovWWcyZnFvb2xEMFl6TGpPQjFEWkhwZlIxN2xwS2pUd2dJNTNUdUtmVGtOZFhUV3J1eU9PaE5CWjd6ZThwM1k4UlZGYWJYUTEzR1k0Qm9pYTBTVGZOOU1LaFM2ZWRJR1lXY1lGcjBxLzk0bE5OeFQwV2FPUWlIb2h3VXZWQnIrcW04UmxxM1pMMWpCWU1LWGVFclRkbzcwUXA1RTFVdTArVzhNMFdwU2dRQ3BPK2NRRll3TWwwclBmZE5SQUNPQU5DcGQ5SWRWdEphZnhQMHRJUE8xUG5wOTRYbklnSkFPdEh1aUNNT0hFaGN1Ykp1dVRBeGF0L2tBSlBKcjd5UU8xZVYybEE4WDlOM3N5MFlnU0JSK2kvd1hWTDRZcGRZKytHK25yNVBDdTJTSkRiLzZnU2NVV3JQcHJ0MENzQ3VBVTE2SHAwL1Jna1ZSWG9rVHpHMFQ1TG1QcnZmcFlCKzNQRUpDVFVPbWlldXRqczRXLy9ZbHMvMU9YdlY3WHYwVXFBODRoS3lLbnpTOXp5ak5KWmpiU0FVUHdFYW9PZkZGUEFVaXc3NXZMZ0FxRjlIVk5GbnFBeU1jOUpyUWpMYzY3ejVZYStWK2EyUFB6VVpBdVB0Vm9tV2dzanlIZXFGa2xUaFZ5RnZZei9jKzhwMkx1ODZmclRWbEJXTjFQTXRqVmhPRk1nNmFZUVBMTGhUcDkyUCtSR2I2UzY1TzVVYnpaUEF5Z1RGbnhqQVU5eHdLenJBaEdaMGRBOEJMcG05WkRWa2dhRnBVRThNUXg1NFVnNGx2cC8rbGhOOEU4aU5INVRCQWNYZkVrVUpoUkY1eEp0V1JUMm1Uc0Y3d3lMWEtmZW9nelh0SDBtNW8zMlovczdqdEQxT3ZrOTYxODlNSFVzNSsrdjZWbkNMZnBuMFcxVGdZR1NReWswSExSZlhPWHREc0lJTStFYko4Sm4rR0xoR1RRMnZQNER4NDQwN05Gb1hDZEtiNS90MUF6K25HNFNidGcwWmlMaGNkV0N4RENMeUVJSldKWVArMDREWlpmQVREcHpzazh6VkQzc3pyQ0w5MThmM0xnOHg4Y2xOWnpDZ25YajBSQmo2eitEV0pCQzBybnhDVkZrZnEzRUhOQWhLVEI0TmF6NkhkOUhiUXVxM3ljVjJYN3dINnE4bzJPdjBFdGlhbW52YmtIcVhsUkd1YWhRZ1BRPT0='
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
