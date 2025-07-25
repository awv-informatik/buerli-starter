import { Suspense, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Leva, useControls, folder } from 'leva'

const sandboxes = {
  Run: lazy(() => import('../packages/with-history-run/src/App')),
  HistoryCache: lazy(() => import('../packages/with-history-cache/src/App')),
  CacheAs1ac214Jsx: lazy(() => import('../packages/with-history-cache-as1ac214-jsx/src/App')),
  CacheRobot: lazy(() => import('../packages/with-history-cache-robot/src/App')),
  CachePipes: lazy(() => import('../packages/with-history-pipes/src/App')),
  SolidCache: lazy(() => import('../packages/with-solid-cache/src/App')),
  Reuse: lazy(() => import('../packages/with-solid-cache-reuse/src/App')),
  Stepviewer: lazy(() => import('../packages/with-solid-stepviewer/src/App')),
}

export default function App() {  
  const { starter } = useControls({ starter: { value: Object.keys(sandboxes)[0], options: Object.keys(sandboxes) } })  
  const El = sandboxes[starter]
  return (
    <>
      <ErrorBoundary fallbackRender={fallbackRender}>
        <Suspense fallback={null}>
          <El />
        </Suspense>
      </ErrorBoundary>
      <div style={{ position: 'relative', zIndex: 0 }}>
        <Leva neverHide />
      </div>
    </>
  )
}

function fallbackRender({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}
