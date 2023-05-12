import { Suspense, lazy } from 'react'
import { Leva, useControls, folder } from 'leva'

const SolidCache = lazy(() => import('../packages/with-solid-cache/src/App'))
const HistoryRun = lazy(() => import('../packages/with-history-run/src/App'))
const HistoryCache = lazy(() => import('../packages/with-history-cache/src/App'))
const HistoryCacheAs1ac214Jsx = lazy(() => import('../packages/with-history-cache-as1ac214-jsx/src/App'))
const HistoryCacheRobot = lazy(() => import('../packages/with-history-cache-robot/src/App'))

const sandboxes = {
  History: {
    Run: HistoryRun,
    Cache: HistoryCache,
    CacheAs1ac214Jsx: HistoryCacheAs1ac214Jsx,
    CacheRobot: HistoryCacheRobot,
  },
  Solid: {
    Cache: SolidCache,
  },
}

export default function App() {
  const { type } = useControls({
    headless: folder({ type: { value: Object.keys(sandboxes)[0], options: Object.keys(sandboxes) } }),
  })
  const [sandbox] = useControls(
    () => ({ headless: folder({ [type]: { value: Object.keys(sandboxes[type])[0], options: Object.keys(sandboxes[type]) } }) }),
    [type],
  )
  const El = sandboxes[type][sandbox[type]]
  return (
    <>
      <Suspense fallback={null}>
        <El />
      </Suspense>
      <div style={{ position: 'relative', zIndex: 0 }}>
        <Leva neverHide />
      </div>
    </>
  )
}
