import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function Fallback() {
  const ref = useRef()
  useFrame(state => (ref.current.position.x = Math.sin(state.clock.elapsedTime * 2)))
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 64, 64]} />
      <meshBasicMaterial color="#556" />
    </mesh>
  )
}
