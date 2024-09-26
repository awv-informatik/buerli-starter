import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { init, useSolid } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Resize, AccumulativeShadows, RandomizedLight } from '@react-three/drei'
import tunnel from 'tunnel-rat'

const t = tunnel()
init('https://awvstatic.com/classcad/dev/wasm/20240925.1')

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const file = urlParams.get('file')
const shadows = JSON.parse(urlParams.get('shadows'))
const bg = urlParams.get('bg') ?? '#f0f0f0'
const ambience = urlParams.get('ambience') ?? 1
const diffuse = urlParams.get('diffuse') ?? Math.PI
const direction = JSON.parse(urlParams.get('direction')) ?? [10, 10, 10]

export default function App() {
  return (
    <>
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows={shadows} orthographic camera={{ position: direction, zoom: 450 }}>
        <color attach="background" args={[bg]} />
        <ambientLight intensity={ambience * Math.PI} />
        <spotLight
          decay={0}
          intensity={diffuse}
          position={[10, 15, -15]}
          angle={0.4}
          penumbra={1}
          castShadow
          shadow-mapSize={2048}
          shadow-bias={-0.0001}
        />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
        <group position={[0, -0.5, 0]}>
          <Center top>
            <Resize>
              <Model />
            </Resize>
          </Center>
          <AccumulativeShadows frames={100}>
            <RandomizedLight radius={6} position={[5, 5, -5]} />
          </AccumulativeShadows>
        </group>
      </Canvas>
      <t.Out />
    </>
  )
}

function Model(props) {
  const { cache, Geometry } = useSolid('with-solid-puppeteer')
  const ref = useRef()

  useLayoutEffect(() => {
    ref.current.traverse(child => {
      if (child.isMesh) child.castShadow = child.receiveShadow = true
    })
  }, [])

  cache(
    async api => {
      const buffer = await fetch(file).then(res => res.arrayBuffer())
      await api.import(buffer)
    },
    ['step', file],
  )
  return (
    <group ref={ref} {...props}>
      <Geometry />
      <t.In>
        <div className="complete" />
      </t.In>
    </group>
  )
}
