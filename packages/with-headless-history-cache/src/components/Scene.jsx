import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Resize, Bounds } from '@react-three/drei'
import { useState } from 'react'
import { Center } from './Center'

const { cache } = headless(history, 'ws://localhost:9091')

export function Scene({ width = 50, ...props }) {
  const [geo] = cache(
    async api => {
      console.log("why")
      const part = await api.createPart('Part')
      const wcsy = await api.createWorkCoordSystem(part, 8, [], [], [0, width / 3, 0], [Math.PI / 3, 0, 0])
      const wcsx = await api.createWorkCoordSystem(part, 8, [], [], [0, -width / 5, -width / 8], [0, 0, 0])
      const a = await api.cylinder(part, [wcsx], 10, width)
      const b = await api.cylinder(part, [wcsy], 10, width)
      await api.boolean(part, 0, [a, b])
      return await api.createBufferGeometry(part)
    },
    [width],
  )

  const [hovered, hover] = useState(false)
  console.log(geo.uuid)

  return (
    <group {...props}>

        <Resize scale={1}>
          <Center top>
            <mesh
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
              castShadow
              receiveShadow
              geometry={geo}>
              <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
            </mesh>
          </Center>
        </Resize>

    </group>
  )
}
