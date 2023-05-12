```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter
npm install
npm run with-headless-history-run
```

Demonstrates the usage of `headless.run` to execute a script and display the results in a BuerliGeometry component. The suspend option would allow you to orchestrate inside useEffect and useLayoutEffect.

```jsx
import { BuerliGeometry, headless } from '@buerli.io/react'
import { history } from '@buerli.io/headless'

const { run } = headless(history, 'ws://localhost:9091')

function Scene({ width = 100 }) {
  const ref = useRef()
  useEffect(() => {
    run(async api => {
      const part = await api.createPart('Part')
      const wcsy = await api.createWorkCoordSystem(part, 8, [], [], [0, width / 3, 0], [Math.PI / 3, 0, 0])
      const wcsx = await api.createWorkCoordSystem(part, 8, [], [], [0, -width / 5, -width / 8], [0, 0, 0])
      const a = await api.cylinder(part, [wcsx], 10, width)
      const b = await api.cylinder(part, [wcsy], 10, width)
      await api.boolean(part, 0, [a, b])
    })
  }, [])

  useLayoutEffect(() => {
    // You can access the scene graph *before* it is rendered on screen here ...
    // This works because buerli geometry suspends.
    ref.current.traverse((child) => {
      // Make all meshes orange
      if (obj.type === 'Mesh') {
        obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
      }
    })
  })

  return (
    <group ref={ref}>
      <BuerliGeometry suspend />
    <group>
  )
}
```
