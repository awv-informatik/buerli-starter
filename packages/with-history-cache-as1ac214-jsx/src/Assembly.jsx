import { history } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import as1ac214 from './resources/as1_ac_214.stp?raw'

const buerli = headless(history, 'ws://localhost:9091')

export function Assembly(props) {

  const n = buerli.cache(
    async api => {
      await api.load(as1ac214, 'stp')
      return (await api.createScene()).nodes
    },
    ['as1_ac_214-jsx'],
  )

  return (
    <group {...props} dispose={null}>
      <group position={[64.64, 125, 282.53]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh geometry={n['52D'].geometry} material={n['52D'].material} position={[232.53, 85.36, 50]} />
      </group>
      <group position={[115.36, 25, 282.53]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <group position={[183.67, -162.16, 68.94]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 81.93]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <group position={[183.67, -184.66, 55.95]} rotation={[-Math.PI, 0, -Math.PI / 2]}>
          <mesh geometry={n['870'].geometry} material={n['870'].material} position={[252.53, 67.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
          <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[252.53, 100.35, 18.94]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />
        </group>
        <mesh geometry={n['52D'].geometry} material={n['52D'].material} position={[232.53, 85.36, 50]} />
      </group>
      <group position={[190, -101.75, -70.53]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={n.A52.geometry} material={n.A52.material} position={[130.53, 176.75, 100]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[130.53, 176.75, 186.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
        <mesh geometry={n['79A'].geometry} material={n['79A'].material} position={[130.53, 176.75, 13.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      </group>
      <mesh geometry={n['100'].geometry} material={n['100'].material} position={[90, 75, 10]} />
    </group>
  )
}
