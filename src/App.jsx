import { Suspense, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Leva, useControls, folder } from 'leva'

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
  const { starter } = useControls({ starter: { value: Object.keys(sandboxes)[1], options: Object.keys(sandboxes) } })
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
