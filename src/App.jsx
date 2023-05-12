import { Leva, useControls, folder } from 'leva'

import SolidCache from '../packages/with-solid-cache/src/App'
import HistoryRun from '../packages/with-history-run/src/App'
import HistoryCache from '../packages/with-history-cache/src/App'
import HistoryCacheAs1ac214Jsx from '../packages/with-history-cache-as1ac214-jsx/src/App'
import HistoryCacheRobot from '../packages/with-history-cache-robot/src/App'

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
    headless: folder({
      type: { value: Object.keys(sandboxes)[0], options: Object.keys(sandboxes) },
    }),
  })

  const [sandbox] = useControls(
    () => ({
      headless: folder({
        [type]: { value: Object.keys(sandboxes[type])[0], options: Object.keys(sandboxes[type]) },
      }),
    }),
    [type],
  )

  const El = sandboxes[type][sandbox[type]]
  return (
    <>
      <El />
      <Leva neverHide />
    </>
  )
}
