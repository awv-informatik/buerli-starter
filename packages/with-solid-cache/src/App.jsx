import * as THREE from 'three'
import { Suspense, useState, useTransition } from 'react'
import { solid } from '@buerli.io/headless'
import { headless } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import { useNormalTexture, useTexture, Decal, AccumulativeShadows, RandomizedLight, Center, OrbitControls, Environment } from '@react-three/drei'
import { Leva, useControls, folder } from 'leva'
import debounce from 'lodash/debounce'
import { Status, Out } from './Pending'
import awvLogoUrl from './resources/awv.png'

// Create a headless history socket
const { cache } = headless(solid, 'ws://localhost:9091')

export default function App() {
  return (
    <>
      <Canvas shadows orthographic camera={{ position: [10, 10, 0], zoom: 100 }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight />
        <spotLight position={[10, 5, -15]} angle={0.2} castShadow />
        {/** The suspense fallback will fire on first load and show a moving sphere */}
        <Suspense fallback={<Status>Loading</Status>}>
          <group position={[0, -1, 0]}>
            <Center top>
              <Model scale={0.035} />
            </Center>
            <AccumulativeShadows temporal alphaTest={0.85} opacity={0.75} frames={100} scale={20}>
              <RandomizedLight radius={6} position={[-15, 10, -10]} bias={0.0001} />
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

function Model(props) {
  // Reacts setTransition can set any regular setState into pending-state which allows you to suspend w/o
  // blocking the UI. https://react.dev/reference/react/startTransition
  const [pending, trans] = useTransition()
  const [width, setWidth] = useState(100)
  const [cut1, setCut1] = useState(70)
  const [cut2, setCut2] = useState(40)
  const [offset, setOffset] = useState(1)
  const sticker = useTexture(awvLogoUrl)

  useControls({
    bracket: folder({
      width: { value: width, min: 10, max: 100, step: 10, onChange: debounce(v => trans(() => setWidth(v)), 40) },
      cut1: { value: cut1, min: 20, max: 70, step: 10, onChange: debounce(v => trans(() => setCut1(v)), 40) },
      cut2: { value: cut2, min: 20, max: 60, step: 10, onChange: debounce(v => trans(() => setCut2(v)), 40) },
      offset: { value: offset, min: 1, max: 4, step: 1, onChange: debounce(v => trans(() => setOffset(v)), 40) },
    }),
  })

  // headless/cache will suspend if the dependencies change. The returned value will then be available
  // and can be used to render the scene. Cache is memoized, the same cache keys will immediately return
  // an already cached entry.
  const geo = cache(
    async api => {
      // Extrusion
      const points = [[0, 0], [100, 0], [100, 20], [20, 20], [20, 50], [10, 50], [10, 100], [0, 100], [0, 0]] // prettier-ignore
      const shape = new THREE.Shape(points.map(xy => new THREE.Vector2(...xy)))
      const solid = api.extrude([0, 0, width], shape)
      // Fillet edges
      const edges1 = api.pick(solid, 'edge', [100, 10, 0], [100, 10, 100], [5, 100, 100], [5, 100, 0])
      const edges2 = api.pick(solid, 'edge', [10, 50, 50], [0, 0, 50], [20, 20, 50])
      api.fillet(5, edges1)
      api.fillet(5, edges2)
      // Boolean subtract
      const cyl1 = api.cylinder(300, cut1)
      api.moveTo(cyl1, [-50, 50, 50])
      api.rotateTo(cyl1, [0, Math.PI / 2, 0])
      const cyl2 = api.cylinder(300, cut2)
      api.moveTo(cyl2, [55, 50, 50])
      api.rotateTo(cyl2, [Math.PI / 2, 0, 0])
      api.subtract(solid, true, cyl1, cyl2)
      // Offset body
      api.offset(solid, offset)
      const geo = await api.createBufferGeometry(solid)

      geo.computeVertexNormals()
      //applyBoxUV(geo)

      return applyCustomUvs(geo)

      return geo
    },
    ['bracket', width, cut1, cut2, offset],
  )

  const [normalMap] = useNormalTexture(12, {
    offset: [0, 0],
    repeat: [4, 4],
    anisotropy: 8,
  })

  return (
    <group {...props}>
      {/** The resulting geometry can be directly attached to a mesh, which is under your full control */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial metalness={0} color="#222" roughness={0.5} normalMap={normalMap} normalScale={0.2} />
        <Decal position={[80, 15, 16]} scale={20} rotation={[Math.PI / 2, 0, -Math.PI / 3]}>
          <meshPhysicalMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-10}
            map={sticker}
            map-flipY={false}
            map-anisotropy={16}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            roughness={1}
            clearcoat={0.5}
            metalness={0.75}
            toneMapped={false}
          />
        </Decal>
      </mesh>
      {pending && <Status>Pending</Status>}
    </group>
  )
}

function applyCustomUvs(bufferGeometry) {
  let uvs = []
  for (let i = 0; i < bufferGeometry.attributes.position.array.length / 9; i++) {
    for (let f = 0; f < 3; f++) {
      const x = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 0)]
      const y = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 1)]
      const z = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 2)]
      let vertex = new THREE.Vector3(x, y, z)
      let n = vertex.normalize()
      uvs.push((Math.atan2(n.x, n.z) / Math.PI) * 0.5 + 0.5, n.y)
    }
  }
  if (bufferGeometry.attributes.uv) delete bufferGeometry.attributes.uv
  bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return bufferGeometry
}

function cartesian2polar(position) {
  var r = Math.sqrt(position.x * position.x + position.z * position.z + position.y * position.y)
  return {
    position,
    r,
    phi: Math.acos(position.y / r),
    theta: Math.atan2(position.z, position.x),
  }
}

function polar2cartesian(polar) {
  return {
    x: polar.distance * Math.cos(polar.radians),
    z: polar.distance * Math.sin(polar.radians),
  }
}

function polar2canvas(polarPoint) {
  return {
    y: polarPoint.phi / Math.PI,
    x: (polarPoint.theta + Math.PI) / (2 * Math.PI),
  }
}

function applySphereUV(bufferGeometry) {
  const uvs = []
  const vertices = []

  bufferGeometry.computeVertexNormals()

  for (let i = 0; i < bufferGeometry.attributes.position.array.length / 3; i++) {
    const x = bufferGeometry.attributes.position.array[i * 3 + 0]
    const y = bufferGeometry.attributes.position.array[i * 3 + 1]
    const z = bufferGeometry.attributes.position.array[i * 3 + 2]
    vertices.push(new THREE.Vector3(x, y, z))
  }

  const polarVertices = vertices.map(cartesian2polar)

  for (let i = 0; i < polarVertices.length / 3; i++) {

    const tri = new THREE.Triangle(polarVertices[i * 3 + 0], polarVertices[i * 3 + 1], polarVertices[i * 3 + 2])
    const normal = tri.getNormal(new THREE.Vector3())

    for (let f = 0; f < 3; f++) {
      let vertex = polarVertices[i * 3 + f]
      if (vertex.theta === 0 && (vertex.phi === 0 || vertex.phi === Math.PI)) {
        var alignedVertice = vertex.phi === 0 ? face.b : face.a
        vertex = {
          phi: vertex.phi,
          theta: polarVertices[alignedVertice].theta,
        }
      }
      if (vertex.theta === Math.PI && cartesian2polar(normal).theta < Math.PI / 2) {
        vertex.theta = -Math.PI
      }
      const canvasPoint = polar2canvas(vertex)
      uvs.push(1 - canvasPoint.x, 1 - canvasPoint.y)
    }
  }

  if (bufferGeometry.attributes.uv) delete bufferGeometry.attributes.uv
  bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return bufferGeometry
}

function applySphereUV__(bufferGeometry) {
  let uvs = []
  for (let i = 0; i < bufferGeometry.attributes.position.array.length / 9; i++) {
    for (let f = 0; f < 3; f++) {
      const x = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 0)]
      const y = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 1)]
      const z = bufferGeometry.attributes.position.array[i * 9 + (3 * f + 2)]
      let vertex = new THREE.Vector3(x, y, z)
      let n = vertex.normalize()
      let yaw = 0.5 - Math.atan2(n.z, -n.x) / (2.0 * Math.PI)
      let pitch = 0.5 - Math.asin(n.y) / Math.PI
      let u = yaw,
        v = pitch
      uvs.push(u, v)
    }
  }
  if (bufferGeometry.attributes.uv) delete bufferGeometry.attributes.uv
  bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return bufferGeometry
}

function _applyBoxUV(geom, transformMatrix, bbox, bbox_max_size) {
  let coords = []
  coords.length = (2 * geom.attributes.position.array.length) / 3

  //maps 3 verts of 1 face on the better side of the cube
  //side of the cube can be XY, XZ or YZ
  let makeUVs = function (v0, v1, v2) {
    //pre-rotate the model so that cube sides match world axis
    v0.applyMatrix4(transformMatrix)
    v1.applyMatrix4(transformMatrix)
    v2.applyMatrix4(transformMatrix)

    //get normal of the face, to know into which cube side it maps better
    let n = new THREE.Vector3()
    n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize()
    n.x = Math.abs(n.x)
    n.y = Math.abs(n.y)
    n.z = Math.abs(n.z)

    let uv0 = new THREE.Vector2()
    let uv1 = new THREE.Vector2()
    let uv2 = new THREE.Vector2()
    // xz mapping
    if (n.y > n.x && n.y > n.z) {
      uv0.x = (v0.x - bbox.min.x) / bbox_max_size
      uv0.y = (bbox.max.z - v0.z) / bbox_max_size
      uv1.x = (v1.x - bbox.min.x) / bbox_max_size
      uv1.y = (bbox.max.z - v1.z) / bbox_max_size
      uv2.x = (v2.x - bbox.min.x) / bbox_max_size
      uv2.y = (bbox.max.z - v2.z) / bbox_max_size
    } else if (n.x > n.y && n.x > n.z) {
      uv0.x = (v0.z - bbox.min.z) / bbox_max_size
      uv0.y = (v0.y - bbox.min.y) / bbox_max_size
      uv1.x = (v1.z - bbox.min.z) / bbox_max_size
      uv1.y = (v1.y - bbox.min.y) / bbox_max_size
      uv2.x = (v2.z - bbox.min.z) / bbox_max_size
      uv2.y = (v2.y - bbox.min.y) / bbox_max_size
    } else if (n.z > n.y && n.z > n.x) {
      uv0.x = (v0.x - bbox.min.x) / bbox_max_size
      uv0.y = (v0.y - bbox.min.y) / bbox_max_size
      uv1.x = (v1.x - bbox.min.x) / bbox_max_size
      uv1.y = (v1.y - bbox.min.y) / bbox_max_size
      uv2.x = (v2.x - bbox.min.x) / bbox_max_size
      uv2.y = (v2.y - bbox.min.y) / bbox_max_size
    }
    return {
      uv0: uv0,
      uv1: uv1,
      uv2: uv2,
    }
  }

  if (geom.index) {
    // is it indexed buffer geometry?
    for (let vi = 0; vi < geom.index.array.length; vi += 3) {
      let idx0 = geom.index.array[vi]
      let idx1 = geom.index.array[vi + 1]
      let idx2 = geom.index.array[vi + 2]
      let vx0 = geom.attributes.position.array[3 * idx0]
      let vy0 = geom.attributes.position.array[3 * idx0 + 1]
      let vz0 = geom.attributes.position.array[3 * idx0 + 2]
      let vx1 = geom.attributes.position.array[3 * idx1]
      let vy1 = geom.attributes.position.array[3 * idx1 + 1]
      let vz1 = geom.attributes.position.array[3 * idx1 + 2]
      let vx2 = geom.attributes.position.array[3 * idx2]
      let vy2 = geom.attributes.position.array[3 * idx2 + 1]
      let vz2 = geom.attributes.position.array[3 * idx2 + 2]
      let v0 = new THREE.Vector3(vx0, vy0, vz0)
      let v1 = new THREE.Vector3(vx1, vy1, vz1)
      let v2 = new THREE.Vector3(vx2, vy2, vz2)
      let uvs = makeUVs(v0, v1, v2)
      coords[2 * idx0] = uvs.uv0.x
      coords[2 * idx0 + 1] = uvs.uv0.y
      coords[2 * idx1] = uvs.uv1.x
      coords[2 * idx1 + 1] = uvs.uv1.y
      coords[2 * idx2] = uvs.uv2.x
      coords[2 * idx2 + 1] = uvs.uv2.y
    }
  } else {
    for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
      let vx0 = geom.attributes.position.array[vi]
      let vy0 = geom.attributes.position.array[vi + 1]
      let vz0 = geom.attributes.position.array[vi + 2]
      let vx1 = geom.attributes.position.array[vi + 3]
      let vy1 = geom.attributes.position.array[vi + 4]
      let vz1 = geom.attributes.position.array[vi + 5]
      let vx2 = geom.attributes.position.array[vi + 6]
      let vy2 = geom.attributes.position.array[vi + 7]
      let vz2 = geom.attributes.position.array[vi + 8]
      let v0 = new THREE.Vector3(vx0, vy0, vz0)
      let v1 = new THREE.Vector3(vx1, vy1, vz1)
      let v2 = new THREE.Vector3(vx2, vy2, vz2)
      let uvs = makeUVs(v0, v1, v2)
      let idx0 = vi / 3
      let idx1 = idx0 + 1
      let idx2 = idx0 + 2
      coords[2 * idx0] = uvs.uv0.x
      coords[2 * idx0 + 1] = uvs.uv0.y
      coords[2 * idx1] = uvs.uv1.x
      coords[2 * idx1 + 1] = uvs.uv1.y
      coords[2 * idx2] = uvs.uv2.x
      coords[2 * idx2 + 1] = uvs.uv2.y
    }
  }
  if (geom.attributes.uv) delete geom.attributes.uv
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(coords, 2))
}

export function applyBoxUV(bufferGeometry) {
  bufferGeometry.computeBoundingBox()
  let bboxSize = bufferGeometry.boundingBox.getSize(new THREE.Vector3())
  let boxSize = Math.min(bboxSize.x, bboxSize.y, bboxSize.z)
  let boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)

  let cube = new THREE.Mesh(boxGeometry)
  cube.rotation.set(0, 0, 0)
  cube.updateWorldMatrix(true, false)

  const transformMatrix = cube.matrix.clone().invert()

  let uvBbox = new THREE.Box3(new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2), new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2))
  _applyBoxUV(bufferGeometry, transformMatrix, uvBbox, boxSize)
  bufferGeometry.attributes.uv.needsUpdate = true
  return bufferGeometry
}
