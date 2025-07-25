import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, MeshTransmissionMaterial, Center, AccumulativeShadows, RandomizedLight, CameraControls, Environment } from '@react-three/drei'
import { useClassCAD } from '@buerli.io/react'
import { init, WASMClient, compression } from '@buerli.io/classcad'
import { Leva } from 'leva'
import as1ac214 from './resources/as1_ac_214.stp?raw'
import { Status, Out } from './Pending'
import { suspend } from 'suspend-react'

const appKey =
  'MS4xLlZZUG51VkNpOGdjQm50RXB0VkE1RnQ1ekVVazNOR1dYMk9weHlxRGJjazRSdGYwTFRPTFl5NVdjYmY4VnFOOXlWTDQ0OUNzSExTbmhQRHZpNEVidXRpdzIrR0d0N0JIZWk1VEhwK2xHZDJpRHhFOEJBQkEwUEFpSzd6ZXpmM0lCZzB2cklka0xkWHFQdzlzenZxTHlDUkM1N1A0MEFaQnNiSlZ4aFRGNjg2WEdkd1c0Wis0b0l1V2NXNU83ZUh6MktnTTY0Mzh3Wk4rWVlIaVBMS2sxTTFLZ2d5SUxpZGdXLzUzSXFRZks5ZkNUZk9KcjRoU3VnWUJiUGpyVzdqZkJ3cE96RGhlZWpaOHl2NkNkU3orSzlnMmJQa0xaa240akV1aDBJM0tzVUhMSmt2b1Y0dStJN2EvdUw3RHd2bUFkK29yRGdXZHFaeXpjTmlUTGltSlFFZDVsMm02L1lKN0hnOFlFeDhXaXZMVW5TZHpGaEM2UVllSGorS2lYaXdPbDZMVS95ZjEyOVNud09kbXNrRU5QbjJkSVRoTTgxL21MR0V0ajlGcytTLy9JaUs4aWhwaDBIMUsreVkwU3h5b1BmNU5veU9aRks4a1RidGRYMmNlekVpRFhhSmZ5OG9GOEtYNFpDOUxyc3F3WHdLaEdxejRtUnk5Q0pMRnBJamtCZ3FubUNzM0hMS3cvdmZwSXlndzFITXB2TU1aemc4RUY1ZDZlQkRKYS9BemJNWWVLTzFSZzNldlBrNkFGNXZLSmxIbldHYzhaazQ0MktaMXZsdzZVazM0SzdtUmVwdURNYXBURHY3Q3lOM1NkVDZ3eC9TR25NSEhydmJXUkFheG50MlhFVEpycFFIQ3RVTUhlOENidVBMeHpKUTY5NERoOVJOWTFhMFlRQnh1U0dKaU1pVUtmSjZzUUxVT2FUQ1VTNkR4YXpIM293cXcwbndpbSs0Nk1MTVlpcG4rMG9rT1NIZUc1b29JZkFteVpLaDdyVlErTUpwUW5SY0NqVXhXencyRUlCbWNaYjFmNnY1QndRWERsSWx6Nmc0VWw5Vlg1N0JscUYyMVovZy9TdjdBSE1rcGNLSWhvWHFDcWxWUkFqS1lLUmlaVHVOQk1OQnZqQllQNVVYUVVVNktFTUJLcTM1ZDA1TDk0YStSeE5rUGl5bVlhL0FpZmxwUDVFZTRXLzdKWkFqOXcrWnBYVmI5R3IrRkNPd3RDcCtDcmkzOEpDSlpQVCt4SEFnckhtcjFNc2FsVjFFbjVQdldaZ0k0ZXlVNDNmUHA3dE9rSE51UkpETjVTYXBrek1VNFNGbER2V3M2emhRY05CVGhuOW5EVmdBZ3V6eUJPN2wwK3lraytFZUFncXQzZXFEa1hkNDlqbGNEL1BEVUNYdVA0ZWRFT0VFWWxMb2w1V1o0ZDZjUlVTQ1VwdFJJWlN6dVRGc1ZPNGNTV08yRWdaaVV3MVovWWcyZnFvb2xEMFl6TGpPQjFEWkhwZlIxN2xwS2pUd2dJNTNUdUtmVGtOZFhUV3J1eU9PaE5CWjd6ZThwM1k4UlZGYWJYUTEzR1k0Qm9pYTBTVGZOOU1LaFM2ZWRJR1lXY1lGcjBxLzk0bE5OeFQwV2FPUWlIb2h3VXZWQnIrcW04UmxxM1pMMWpCWU1LWGVFclRkbzcwUXA1RTFVdTArVzhNMFdwU2dRQ3BPK2NRRll3TWwwclBmZE5SQUNPQU5DcGQ5SWRWdEphZnhQMHRJUE8xUG5wOTRYbklnSkFPdEh1aUNNT0hFaGN1Ykp1dVRBeGF0L2tBSlBKcjd5UU8xZVYybEE4WDlOM3N5MFlnU0JSK2kvd1hWTDRZcGRZKytHK25yNVBDdTJTSkRiLzZnU2NVV3JQcHJ0MENzQ3VBVTE2SHAwL1Jna1ZSWG9rVHpHMFQ1TG1QcnZmcFlCKzNQRUpDVFVPbWlldXRqczRXLy9ZbHMvMU9YdlY3WHYwVXFBODRoS3lLbnpTOXp5ak5KWmpiU0FVUHdFYW9PZkZGUEFVaXc3NXZMZ0FxRjlIVk5GbnFBeU1jOUpyUWpMYzY3ejVZYStWK2EyUFB6VVpBdVB0Vm9tV2dzanlIZXFGa2xUaFZ5RnZZei9jKzhwMkx1ODZmclRWbEJXTjFQTXRqVmhPRk1nNmFZUVBMTGhUcDkyUCtSR2I2UzY1TzVVYnpaUEF5Z1RGbnhqQVU5eHdLenJBaEdaMGRBOEJMcG05WkRWa2dhRnBVRThNUXg1NFVnNGx2cC8rbGhOOEU4aU5INVRCQWNYZkVrVUpoUkY1eEp0V1JUMm1Uc0Y3d3lMWEtmZW9nelh0SDBtNW8zMlovczdqdEQxT3ZrOTYxODlNSFVzNSsrdjZWbkNMZnBuMFcxVGdZR1NReWswSExSZlhPWHREc0lJTStFYko4Sm4rR0xoR1RRMnZQNER4NDQwN05Gb1hDZEtiNS90MUF6K25HNFNidGcwWmlMaGNkV0N4RENMeUVJSldKWVArMDREWlpmQVREcHpzazh6VkQzc3pyQ0w5MThmM0xnOHg4Y2xOWnpDZ25YajBSQmo2eitEV0pCQzBybnhDVkZrZnEzRUhOQWhLVEI0TmF6NkhkOUhiUXVxM3ljVjJYN3dINnE4bzJPdjBFdGlhbW52YmtIcVhsUkd1YWhRZ1BRPT0='
init(did => new WASMClient(did, { appKey }))

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight decay={0} position={[20, 10, 25]} angle={0.5} penumbra={1} castShadow />
        <group position={[0, -2, 0]}>
          {/** The suspense fallback will fire on first load and show a moving sphere */}
          <Suspense fallback={<Status>Loading</Status>}>
            <Center top>
              <Assembly scale={0.03} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} color="red" opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-10, 10, -15]} bias={0.0001} />
            </AccumulativeShadows>
          </Suspense>
        </group>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
    </>
  )
}

function Assembly(props) {
  const { api: { v1: api }, drawing } = useClassCAD('with-history-cache-as1ac214-jsx') // prettier-ignore
  const { nodes } = suspend(async () => {
    await api.common.clear()
    const part = await api.part.create({ name: 'Part' })
    const data = compression.encodeToBase64(as1ac214)
    const model = await api.part.importFeature({ id: part, data, format: 'STP', encoding: 'base64', name: 'Part' })    
    return await drawing.createScene(part)
  }, ['as1_ac_214-jsx'])

  console.log('nodes', nodes)

  return (
    <group {...props} dispose={null}>
      <primitive object={nodes['Part']} />
    </group>
  )

  const [gBolt, mBolt] = [nodes['870'].geometry, nodes['870'].material]
  const [gNut, mNut] = [nodes['79A'].geometry, nodes['79A'].material]
  const [gBracket, mBracket] = [nodes['52D'].geometry, nodes['52D'].material]
  const [gPlate, mPlate] = [nodes['100'].geometry, nodes['100'].material]
  const [gBar, mBar] = [nodes['A52'].geometry, nodes['A52'].material]
  return (
    <group {...props} dispose={null}>
      <group position={[64.64, 125, 282.53]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh castShadow receiveShadow geometry={gBracket} material={mBracket} position={[232.53, 85.36, 50]} />
      </group>
      <group position={[115.36, 25, 282.53]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh castShadow receiveShadow geometry={gBolt} material={mBolt} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh castShadow receiveShadow geometry={gBracket} material={mBracket} position={[232.53, 85.36, 50]}>
          <MeshTransmissionMaterial thickness={10} anisotropy={1} chromaticAberration={1} roughness={0.75} samples={20} clearcoat={1} />
        </mesh>
      </group>
      <group position={[190, -101.75, -70.53]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow geometry={gBar} material={mBar} position={[130.53, 176.75, 100]} rotation={[0, 0, Math.PI / 2]} />
        <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[130.53, 176.75, 186.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
        <mesh castShadow receiveShadow geometry={gNut} material={mNut} position={[130.53, 176.75, 13.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      </group>
      <mesh castShadow receiveShadow geometry={gPlate} material={mPlate} position={[90, 75, 10]}>
        <Html
          occlude
          transform
          distanceFactor={200}
          position={[-80, 80, 20]}
          rotation={[0, 0, 0]}
          style={{ padding: '10px 20px', borderRadius: 7, background: 'black', color: 'white' }}>
          &lt;Hello/&gt; 👋
        </Html>
      </mesh>
    </group>
  )
}
