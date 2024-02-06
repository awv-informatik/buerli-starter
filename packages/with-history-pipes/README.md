```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter/packages/with-history-pipes
npm install
npm run dev
```

Demonstrates the usage of `headless.useBuerli` which ties a headless session to a mounted component. As long as that component is mounted the session persists.

```jsx
import { History } from '@buerli.io/headless'
import { BuerliGeometry, useHeadless } from '@buerli.io/react'

function Tab({ id }) {
  const buerli = useHeadless(History, `ws://localhost:9091?session=${id}`)
  // ...
  return (
    <Canvas>
      <BuerliGeometry drawingId={drawingId} suspend selection />
```
