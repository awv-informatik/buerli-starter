import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { Solid } from '@buerli.io/headless'
import { headless, BuerliGeometry } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Resize, AccumulativeShadows, RandomizedLight } from '@react-three/drei'
import tunnel from 'tunnel-rat'

const t = tunnel()
const { cache, useDrawingId } = headless(Solid, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows orthographic camera={{ position: [10, 10, 10], zoom: 450 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight
          decay={0}
          intensity={Math.PI}
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
  const ref = useRef()
  const drawingId = useDrawingId()
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const file = urlParams.get('file')

  useLayoutEffect(() => {
    ref.current.traverse(child => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = true        
        //child.material = new THREE.MeshStandardMaterial()
        //child.material.roughness = 0
        //child.material.metalness = 1
      }
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
      <BuerliGeometry suspend drawingId={drawingId} />
      <t.In>
        <div className="complete" />
      </t.In>
    </group>
  )
}
