import { Suspense, useState, useTransition, useEffect } from 'react'
import { useFirstMountState } from 'react-use'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, CameraControls, Environment } from '@react-three/drei'
import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { WorkCoordSystemType } from '@buerli.io/classcad'
import { Leva } from 'leva'
import { Status, Out } from './Pending'

// Create a headless history socket
const buerli = headless(history, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [0, 2.5, 10], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[-10, 5, -15]} angle={0.2} castShadow />
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

export function Flange(props) {
  const isFirstMount = useFirstMountState()
  const [hovered, hover] = useState(false)
  const [pending, start] = useTransition()

  const [thickness, setThickness] = useState(30)
  const [baseCylDiam, setBaseCylDiam] = useState(200)
  const expressions = [
    { name: 'thickness', value: thickness },
    { name: 'baseCylDiam', value: baseCylDiam },
  ]

  useEffect(() => {
    window.addEventListener('message', function (e) {
      if (e.data && e.data.name === 'elfsquad.configurationUpdated') {
        const configuration = e.data.args
        const option1 = e.data.args.steps[0].features[0].features[0].isSelected
        const option2 = e.data.args.steps[0].features[0].features[1].isSelected
        const option3 = e.data.args.steps[0].features[0].features[2].isSelected
        if (option1) start(() => setBaseCylDiam(200))
        else if (option2) start(() => setBaseCylDiam(250))
        else if (option3) start(() => setBaseCylDiam(300))
        else start(() => setBaseCylDiam(200))
      }
    })
  }, [])

  // This block creates a flange and results in a part, it will only run once.
  const part = buerli.cache(
    async api => {
      const part = api.createPart('flange')
      api.createExpressions(part, ...expressions)
      const wcsCenter = api.createWorkCoordSystem(part, WorkCoordSystemType.WCS_CUSTOM, [], [], [0, 0, 0], [0, 0, 0])
      const baseCyl = api.cylinder(part, [wcsCenter], 'ExpressionSet.baseCylDiam', 'ExpressionSet.thickness')
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
    ['flange', part, thickness, baseCylDiam],
  )

  // The geometry can be now be attached to a mesh, which is under our full control.
  return (
    <mesh geometry={geo} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={pending ? 'gray' : hovered ? 'hotpink' : 'orange'} />
      {pending && <Status>Pending</Status>}
    </mesh>
  )
}
