import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, N8AO, HueSaturation } from '@react-three/postprocessing'
import { Leva, useControls, folder } from 'leva'
import { Components, useInputContext, styled, createPlugin } from 'leva/plugin'
import { useDropzone } from 'react-dropzone'
import { Toaster } from 'react-hot-toast'
import { Status, Out } from './Pending'
import { Model } from './Model'

export const StyledButton = styled('button', {
  display: 'block',
  $reset: '',
  fontWeight: '$button',
  height: '$rowHeight',
  borderStyle: 'none',
  borderRadius: '$sm',
  backgroundColor: '$elevation1',
  color: '$highlight1',
  '&:not(:disabled)': {
    color: '$highlight3',
    backgroundColor: '$accent2',
    cursor: 'pointer',
    $hover: '$accent3',
    $active: '$accent3 $accent1',
    $focus: '',
  },
})

const plugin = createPlugin({
  sanitize: () => null,
  normalize: onLoad => ({ value: {}, settings: { onLoad } }),
  component: () => {
    const { settings } = useInputContext()
    const onDrop = useCallback(acceptedFiles => {
      const reader = new FileReader()
      reader.onload = () => settings.onLoad(reader.result)
      reader.readAsArrayBuffer(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return (
      <Components.Row>
        <StyledButton {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? 'Drop the files here ...' : 'Drag or click to select files'}
        </StyledButton>
      </Components.Row>
    )
  },
})

export default function App() {
  const [buffer, set] = useState(null)
  useControls({
    pipes: folder({
      upload: plugin(set),
    }),
  })

  return (
    <>
      <Canvas shadows orthographic camera={{ position: [10, 5, 10], zoom: 175 }}>
        <color attach="background" args={['#f0f0f0']} />    
        <group position={[0, -1, 0]}>
          <Suspense fallback={<Status>Loading</Status>}>
            {buffer && (
              <Center top>
                <Model buffer={buffer} rotation={[-Math.PI / 2, 0, 0]} scale={0.01} />
              </Center>
            )}
            <AccumulativeShadows temporal alphaTest={0.85} opacity={1} frames={100} scale={20}>
              <RandomizedLight radius={10} position={[-15, 10, -10]} bias={0.0001} />
            </AccumulativeShadows>
          </Suspense>
        </group>
        <EffectComposer disableNormalPass>
          <N8AO aoRadius={0.4} intensity={4} />
          <HueSaturation hue={0} saturation={-1} />
        </EffectComposer>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr" />
      </Canvas>
      <Leva neverHide titleBar={{ title: <Out /> }} />
      <Toaster toastOptions={{ style: { position: 'relative', bottom: 40 } }} position="bottom-center" />
    </>
  )
}
