import { Suspense, useLayoutEffect, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Leva, useControls } from 'leva'
import { clear } from 'suspend-react'

const sandboxes = {
  PartRun: lazy(() => import('../packages/with-part-run/src/App')),
  PartCache: lazy(() => import('../packages/with-part-cache/src/App')),
  AssemblyCacheAs1ac214Jsx: lazy(() => import('../packages/with-assembly-cache-as1ac214-jsx/src/App')),
  AssemblyCacheRobot: lazy(() => import('../packages/with-assembly-cache-robot/src/App')),
  AssemblyPipes: lazy(() => import('../packages/with-assembly-pipes/src/App')),
  SolidCache: lazy(() => import('../packages/with-solid-cache/src/App')),
  SolidCacheReuse: lazy(() => import('../packages/with-solid-cache-reuse/src/App')),
  Stepviewer: lazy(() => import('../packages/with-stepviewer/src/App')),
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const urlStarter = params.get('starter')
  const locked = urlStarter && urlStarter in sandboxes
  const { starter } = useControls({ starter: { value: locked ? urlStarter : Object.keys(sandboxes)[0], options: Object.keys(sandboxes) } })
  const El = sandboxes[locked ? urlStarter : starter]
  // Clear out the old suspend-cache to allow sandboxes to re-mount with fresh state
  useLayoutEffect(() => clear(), [starter])
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
