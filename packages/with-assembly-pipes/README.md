```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter/packages/with-assembly-pipes
npm install
npm run dev
```

Demonstrates the usage of [useBuerliCadFacade](https://buerli.io/docs/api/react) which ties a ClassCAD/buerli session to a mounted component. As long as that component is mounted the session persists.

```jsx
import { useBuerliCadFacade } from '@buerli.io/react'

function Tab({ id }) {
  const { api: { v1: api }} = useBuerliCadFacade(`with-history-pipes-${id}`)
  // ...
  return (
    <Canvas>
      <View id={id} />
      // ...
  )
}

function View({ id }) {
  const { Geometry } = useBuerliCadFacade(`with-history-pipes-${id}`)
  // ...
  return (
    <group ref={ref}>
      <Geometry selection />
    </group>
  )
}
```
