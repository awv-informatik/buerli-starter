import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, ScgGraphicType } from '@buerli.io/classcad'
import { Canvas } from '@react-three/fiber'
import { Resize, Center, Bounds, AccumulativeShadows, RandomizedLight, OrbitControls, Environment } from '@react-three/drei'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRpdzIrR0d0N0JIZWk1VEhwK2xHZDJpRHhFOEJBQkEwUEFpSzd6ZXpmM0lCZzB2cklka0xkWHFQdzlzenZxTHlDUkM1N1A0MEFaQnNiSlZ4aFRGNjg2WEdkd1c0Wis0b0l1V2NXNU83ZUh6MktnTTY0Mzh3Wk4rWVlIaVBMS2sxTTFLZ2d5SUxpZGdXLzUzSXFRZks5ZkNUZk9KcjRoU3VnWUJiUGpyVzdqZkJ3cE96RGhlZWpaOHl2NkNkU3orSzlnMmJQa0xaa240akV1aDBJM0tzVUhMSmt2b1Y0dStJN2EvdUw3RHd2bUFkK29yRGdXZHFaeXpjTmlUTGltSlFFZDVsMm02L1lKN0hnOFlFeDhXaXZMVW5TZHpGaEM2UVllSGorS2lYaXdPbDZMVS95ZjEyOVNud09kbXNrRU5QbjJkSVRoTTgxL21MR0V0ajlGcytTLy9JaUs4aWhwaDBIMUsreVkwU3h5b1BmNU5veU9aRks4a1RidGRYMmNlekVpRFhhSmZ5OG9GOEtYNFpDOUxyc3F3WHdLaEdxejRtUnk5Q0pMRnBJamtCZ3FubUNzM0hMS3cvdmZwSXlndzFITXB2TU1aemc4RUY1ZDZlQkRKYS9BemJNWWVLTzFSZzNldlBrNkFGNXZLSmxIbldHYzhaazQ0MktaMXZsdzZVazM0SzdtUmVwdURNYXBURHY3Q3lOM1NkVDZ3eC9TR25NSEhydmJXUkFheG50MlhFVEpycFFIQ3RVTUhlOENidVBMeHpKUTY5NERoOVJOWTFhMFlRQnh1U0dKaU1pVUtmSjZzUUxVT2FUQ1VTNkR4YXpIM293cXcwbndpbSs0Nk1MTVlpcG4rMG9rT1NIZUc1b29JZkFteVpLaDdyVlErTUpwUW5SY0NqVXhXencyRUlCbWNaYjFmNnY1QndRWERsSWx6Nmc0VWw5Vlg1N0JscUYyMVovZy9TdjdBSE1rcGNLSWhvWHFDcWxWUkFqS1lLUmlaVHVOQk1OQnZqQllQNVVYUVVVNktFTUJLcTM1ZDA1TDk0YStSeE5rUGl5bVlhL0FpZmxwUDVFZTRXLzdKWkFqOXcrWnBYVmI5R3IrRkNPd3RDcCtDcmkzOEpDSlpQVCt4SEFnckhtcjFNc2FsVjFFbjVQdldaZ0k0ZXlVNDNmUHA3dE9rSE51UkpETjVTYXBrek1VNFNGbER2V3M2emhRY05CVGhuOW5EVmdBZ3V6eUJPN2wwK3lraytFZUFncXQzZXFEa1hkNDlqbGNEL1BEVUNYdVA0ZWRFT0VFWWxMb2w1V1o0ZDZjUlVTQ1VwdFJJWlN6dVRGc1ZPNGNTV08yRWdaaVV3MVovWWcyZnFvb2xEMFl6TGpPQjFEWkhwZlIxN2xwS2pUd2dJNTNUdUtmVGtOZFhUV3J1eU9PaE5CWjd6ZThwM1k4UlZGYWJYUTEzR1k0Qm9pYTBTVGZOOU1LaFM2ZWRJR1lXY1lGcjBxLzk0bE5OeFQwV2FPUWlIb2h3VXZWQnIrcW04UmxxM1pMMWpCWU1LWGVFclRkbzcwUXA1RTFVdTArVzhNMFdwU2dRQ3BPK2NRRll3TWwwclBmZE5SQUNPQU5DcGQ5SWRWdEphZnhQMHRJUE8xUG5wOTRYbklnSkFPdEh1aUNNT0hFaGN1Ykp1dVRBeGF0L2tBSlBKcjd5UU8xZVYybEE4WDlOM3N5MFlnU0JSK2kvd1hWTDRZcGRZKytHK25yNVBDdTJTSkRiLzZnU2NVV3JQcHJ0MENzQ3VBVTE2SHAwL1Jna1ZSWG9rVHpHMFQ1TG1QcnZmcFlCKzNQRUpDVFVPbWlldXRqczRXLy9ZbHMvMU9YdlY3WHYwVXFBODRoS3lLbnpTOXp5ak5KWmpiU0FVUHdFYW9PZkZGUEFVaXc3NXZMZ0FxRjlIVk5GbnFBeU1jOUpyUWpMYzY3ejVZYStWK2EyUFB6VVpBdVB0Vm9tV2dzanlIZXFGa2xUaFZ5RnZZei9jKzhwMkx1ODZmclRWbEJXTjFQTXRqVmhPRk1nNmFZUVBMTGhUcDkyUCtSR2I2UzY1TzVVYnpaUEF5Z1RGbnhqQVU5eHdLenJBaEdaMGRBOEJMcG05WkRWa2dhRnBVRThNUXg1NFVnNGx2cC8rbGhOOEU4aU5INVRCQWNYZkVrVUpoUkY1eEp0V1JUMm1Uc0Y3d3lMWEtmZW9nelh0SDBtNW8zMlovczdqdEQxT3ZrOTYxODlNSFVzNSsrdjZWbkNMZnBuMFcxVGdZR1NReWswSExSZlhPWHREc0lJTStFYko4Sm4rR0xoR1RRMnZQNER4NDQwN05Gb1hDZEtiNS90MUF6K25HNFNidGcwWmlMaGNkV0N4RENMeUVJSldKWVArMDREWlpmQVREcHpzazh6VkQzc3pyQ0w5MThmM0xnOHg4Y2xOWnpDZ25YajBSQmo2eitEV0pCQzBybnhDVkZrZnEzRUhOQWhLVEI0TmF6NkhkOUhiUXVxM3ljVjJYN3dINnE4bzJPdjBFdGlhbW52YmtIcVhsUkd1YWhRZ1BRPT0='
init(did => new WASMClient(did, { appKey }))

export default function App() {
  return (
    <>
      <Canvas shadows gl={{ antialias: false }} orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={Math.PI} />
        <spotLight decay={0} position={[-10, 5, -15]} angle={0.2} castShadow />
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Scene />
            <AccumulativeShadows alphaTest={0.65} frames={50} scale={20}>
              <RandomizedLight radius={4} position={[-10, 6, -15]} bias={0.0001} />
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

function Scene({ width = 50, ...props }) {
  const { api: { v1: api }, drawing, Geometry } = useClassCAD('with-history-run') // prettier-ignore
  const geometry = useRef()

  useEffect(() => {
    async function run() {
      const part = await api.part.create({ name: 'Part' })
      const wcsx = await api.part.workCSys({ id: part, rotation: [0, -width / 5, -width / 8] })
      await api.part.cylinder({ id: part, references: [wcsx], diameter: 10, height: width })
      const sel = (await drawing.selectGeometry([ScgGraphicType.CIRCLE], 2)).map(sel => sel.graphicId)
      api.part.chamfer({ id: part, type: 'EQUAL_DISTANCE', references: sel, distance1: 2, distance2: 2, angle: 45 })
    }
    run()
  }, [])

  useLayoutEffect(() => {
    geometry.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
    })
  })

  return (
    <group {...props}>
      <Bounds fit observe margin={1.75}>
        <Resize scale={2}>
          <Center top ref={geometry} rotation={[0, -Math.PI / 4, 0]}>
            <Geometry selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
