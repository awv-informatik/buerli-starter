<img src="thumbnail.jpg" width="100%" />
<br />

```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter/packages/with-part-run
npm install
npm run dev
```

Demonstrates the usage of [useBuerliCadFacade](https://buerli.io/docs/api/react) to execute a script and display the results in a BuerliGeometry component. The suspend option would allow you to orchestrate inside useEffect and useLayoutEffect.

```jsx
function Scene({ width = 50, ...props }) {
  const { api: { v1: api }, facade, Geometry } = useBuerliCadFacade('with-history-run') // prettier-ignore
  const geometry = useRef()

  useEffect(() => {
    async function run() {
      api.common.clear()
      const part = await api.part.create({ name: 'Part' })
      const wcsx = await api.part.workCSys({ id: part, rotation: [0, -width / 5, -width / 8] })
      await api.part.cylinder({ id: part, references: [wcsx], diameter: 10, height: width })
      const sel = (await facade.selectGeometry([ScgGraphicType.CIRCLE], 2)).map(sel => sel.graphicId)
      api.part.chamfer({ id: part, type: 'EQUAL_DISTANCE', references: sel, distance1: 2, distance2: 2, angle: 45 })
    }
    run()
  }, [])

  useLayoutEffect(() => {
    geometry.current?.traverse(obj => {
      obj.receiveShadow = obj.castShadow = true
      if (obj.type === 'Mesh') obj.material = new THREE.MeshStandardMaterial({ color: 'orange', roughness: 0.5 })
    })
  })

  return (
    <group {...props}>
      <Bounds fit observe margin={1.75}>
        <Resize scale={2}>
          <Center top ref={geometry} rotation={[0, -Math.PI / 4, 0]}>
            <Geometry selection />
          </Center>
        </Resize>
      </Bounds>
    </group>
  )
}
```
