import { Suspense, useState, useRef, useTransition } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, compression } from '@buerli.io/classcad'
import debounce from 'lodash/debounce'
import { easing } from 'maath'
import { Leva, useControls, folder } from 'leva'
import { Status, Out } from './Pending'
import robotArm from './resources/Robot6Axis.ofb?raw'
import { suspend } from 'suspend-react'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRpdzIrR0d0N0JIZWk1VEhwK2xHZDJpRHhFOEJBQkEwUEFpSzd6ZXpmM0lCZzB2cklka0xkWHFQdzlzenZxTHlDUkM1N1A0MEFaQnNiSlZ4aFRGNjg2WEdkd1c0Wis0b0l1V2NXNU83ZUh6MktnTTY0Mzh3Wk4rWVlIaVBMS2sxTTFLZ2d5SUxpZGdXLzUzSXFRZks5ZkNUZk9KcjRoU3VnWUJiUGpyVzdqZkJ3cE96RGhlZWpaOHl2NkNkU3orSzlnMmJQa0xaa240akV1aDBJM0tzVUhMSmt2b1Y0dStJN2EvdUw3RHd2bUFkK29yRGdXZHFaeXpjTmlUTGltSlFFZDVsMm02L1lKN0hnOFlFeDhXaXZMVW5TZHpGaEM2UVllSGorS2lYaXdPbDZMVS95ZjEyOVNud09kbXNrRU5QbjJkSVRoTTgxL21MR0V0ajlGcytTLy9JaUs4aWhwaDBIMUsreVkwU3h5b1BmNU5veU9aRks4a1RidGRYMmNlekVpRFhhSmZ5OG9GOEtYNFpDOUxyc3F3WHdLaEdxejRtUnk5Q0pMRnBJamtCZ3FubUNzM0hMS3cvdmZwSXlndzFITXB2TU1aemc4RUY1ZDZlQkRKYS9BemJNWWVLTzFSZzNldlBrNkFGNXZLSmxIbldHYzhaazQ0MktaMXZsdzZVazM0SzdtUmVwdURNYXBURHY3Q3lOM1NkVDZ3eC9TR25NSEhydmJXUkFheG50MlhFVEpycFFIQ3RVTUhlOENidVBMeHpKUTY5NERoOVJOWTFhMFlRQnh1U0dKaU1pVUtmSjZzUUxVT2FUQ1VTNkR4YXpIM293cXcwbndpbSs0Nk1MTVlpcG4rMG9rT1NIZUc1b29JZkFteVpLaDdyVlErTUpwUW5SY0NqVXhXencyRUlCbWNaYjFmNnY1QndRWERsSWx6Nmc0VWw5Vlg1N0JscUYyMVovZy9TdjdBSE1rcGNLSWhvWHFDcWxWUkFqS1lLUmlaVHVOQk1OQnZqQllQNVVYUVVVNktFTUJLcTM1ZDA1TDk0YStSeE5rUGl5bVlhL0FpZmxwUDVFZTRXLzdKWkFqOXcrWnBYVmI5R3IrRkNPd3RDcCtDcmkzOEpDSlpQVCt4SEFnckhtcjFNc2FsVjFFbjVQdldaZ0k0ZXlVNDNmUHA3dE9rSE51UkpETjVTYXBrek1VNFNGbER2V3M2emhRY05CVGhuOW5EVmdBZ3V6eUJPN2wwK3lraytFZUFncXQzZXFEa1hkNDlqbGNEL1BEVUNYdVA0ZWRFT0VFWWxMb2w1V1o0ZDZjUlVTQ1VwdFJJWlN6dVRGc1ZPNGNTV08yRWdaaVV3MVovWWcyZnFvb2xEMFl6TGpPQjFEWkhwZlIxN2xwS2pUd2dJNTNUdUtmVGtOZFhUV3J1eU9PaE5CWjd6ZThwM1k4UlZGYWJYUTEzR1k0Qm9pYTBTVGZOOU1LaFM2ZWRJR1lXY1lGcjBxLzk0bE5OeFQwV2FPUWlIb2h3VXZWQnIrcW04UmxxM1pMMWpCWU1LWGVFclRkbzcwUXA1RTFVdTArVzhNMFdwU2dRQ3BPK2NRRll3TWwwclBmZE5SQUNPQU5DcGQ5SWRWdEphZnhQMHRJUE8xUG5wOTRYbklnSkFPdEh1aUNNT0hFaGN1Ykp1dVRBeGF0L2tBSlBKcjd5UU8xZVYybEE4WDlOM3N5MFlnU0JSK2kvd1hWTDRZcGRZKytHK25yNVBDdTJTSkRiLzZnU2NVV3JQcHJ0MENzQ3VBVTE2SHAwL1Jna1ZSWG9rVHpHMFQ1TG1QcnZmcFlCKzNQRUpDVFVPbWlldXRqczRXLy9ZbHMvMU9YdlY3WHYwVXFBODRoS3lLbnpTOXp5ak5KWmpiU0FVUHdFYW9PZkZGUEFVaXc3NXZMZ0FxRjlIVk5GbnFBeU1jOUpyUWpMYzY3ejVZYStWK2EyUFB6VVpBdVB0Vm9tV2dzanlIZXFGa2xUaFZ5RnZZei9jKzhwMkx1ODZmclRWbEJXTjFQTXRqVmhPRk1nNmFZUVBMTGhUcDkyUCtSR2I2UzY1TzVVYnpaUEF5Z1RGbnhqQVU5eHdLenJBaEdaMGRBOEJMcG05WkRWa2dhRnBVRThNUXg1NFVnNGx2cC8rbGhOOEU4aU5INVRCQWNYZkVrVUpoUkY1eEp0V1JUMm1Uc0Y3d3lMWEtmZW9nelh0SDBtNW8zMlovczdqdEQxT3ZrOTYxODlNSFVzNSsrdjZWbkNMZnBuMFcxVGdZR1NReWswSExSZlhPWHREc0lJTStFYko4Sm4rR0xoR1RRMnZQNER4NDQwN05Gb1hDZEtiNS90MUF6K25HNFNidGcwWmlMaGNkV0N4RENMeUVJSldKWVArMDREWlpmQVREcHpzazh6VkQzc3pyQ0w5MThmM0xnOHg4Y2xOWnpDZ25YajBSQmo2eitEV0pCQzBybnhDVkZrZnEzRUhOQWhLVEI0TmF6NkhkOUhiUXVxM3ljVjJYN3dINnE4bzJPdjBFdGlhbW52YmtIcVhsUkd1YWhRZ1BRPT0='
init(did => new WASMClient(did, { appKey }))

const store = {
  asm: null,
  constraints: [
    { name: 'Base-J1', value: 0, step: 5, min: 0, max: 360, node: null },
    { name: 'J1-J2', value: 0, step: 1, min: -60, max: 160, node: null },
    { name: 'J2-J3', value: 0, step: 1, min: -230, max: 45, node: null },
    { name: 'J3-J4', value: 0, step: 1, min: -180, max: 180, node: null },
    { name: 'J4-J5', value: 0, step: 1, min: -90, max: 90, node: null },
    { name: 'J5-J6', value: 0, step: 1, min: -180, max: 180, node: null },
  ],
}

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight decay={0} position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
        <group position={[0, -3, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Robot scale={0.01} />
          </Suspense>
          <ContactShadows scale={20} blur={2} />
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Robot(props) {
  const ref = useRef()
  const { api: { v1: api }, drawing } = useClassCAD() // prettier-ignore
  // 1. Create scene, fetch constraints, return scene nodes
  const { nodes } = suspend(async () => {
    const data = compression.encodeToBase64(robotArm)
    const { result: { id: rootAsm } } = await api.common.load({ data, format: 'ofb', ident: 'root', encoding: 'base64' }) // prettier-ignore
    store.asm = rootAsm
    for (let i = 0; i < store.constraints.length; i++) {
      const { result: node } = await api.assembly.getRevolute({ id: store.asm, name: store.constraints[i].name })
      store.constraints[i].node = node
    }
    console.log(store)
    return await drawing.createScene()
  }, ['robot'])

  // 2. Hold axis values in state, update them on change, useTransition creates pending state
  const [pending, start] = useTransition()
  const [values, setValues] = useState(store.constraints.map(constraint => constraint.value))
  useControls({
    robot6: folder(
      store.constraints.reduce(
        (prev, { node, name, ...config }, index) => ({
          ...prev,
          [name]: {
            ...config,
            onChange: debounce(v => start(() => setValues(values => values.map((value, i) => (i === index ? v : value)))), 40),
          },
        }),
        {},
      ),
    ),
  })

  // 3. Create a structure-only scene whenever values change
  const { nodes: structure } = suspend(async () => {
    const constraints = store.constraints.map(({ node }, index) => ({ id: node.id, name: 'Z_ROTATION', value: (values[index] / 180) * Math.PI }))
    await api.assembly.update3DConstraintValue(constraints)
    return await drawing.createScene(undefined, { structureOnly: true })
  }, ['robot-struct', ...values])

  // 4. useFrame to update the position and rotations of the nodes
  useFrame((state, delta) => {
    ref.current.children.forEach((child, index) => {
      easing.damp3(child.position, structure[`NAUO${index + 1}`].position, 0.1, delta)
      easing.dampQ(child.quaternion, structure[`NAUO${index + 1}`].quaternion, 0.1, delta)
    })
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
