import { init, SocketIOClient, AwvNodeClient } from '@buerli.io/classcad'
import { BuerliState } from '@buerli.io/core'
import { solid, history } from '@buerli.io/headless'
import { suspend, peek, preload } from 'suspend-react'

type Tuple<T = any> = [T] | T[]
type Await<T> = T extends Promise<infer V> ? V : never

type HeadlessConfig = Partial<BuerliState['options']> & {
  /** Buerli socket adapter, default: SocketIOClient */
  socket?: new (...args: any) => AwvNodeClient
  /** Suspense entry invalidation in ms, default: 0 (keep-alive forever) */
  lifespan?: number
  /** Suspense cache equality function, default: (a, b) => a === b (reference equality) */
  equal?: (a: any, b: any) => boolean
}

export const headless = <Return>(
  impl: typeof solid | typeof history,
  url: string,
  { socket, lifespan, equal, ...config }: HeadlessConfig = {},
) => {
  init(id => new (socket || SocketIOClient)(url, id), config)
  const instance = new impl()
  const instanceApi = new Promise<Return>(resolve => instance.init(api => resolve(api as unknown as Return)))
  return {
    instance,
    cache: <Keys extends Tuple<unknown>, Fn extends (api: Return, ...keys: Keys) => Promise<unknown>>(
      callback: Fn,
      dependencies: Keys,
    ) =>
      suspend(async (...keys: Keys) => callback(await instanceApi, ...keys) as Await<ReturnType<Fn>>, dependencies, {
        lifespan,
        equal,
      }),
    run: async <Fn extends (api: Return) => Promise<unknown>>(callback: Fn) =>
      callback(await instanceApi) as Await<ReturnType<Fn>>,
    peek: <Keys extends Tuple<unknown>>(dependencies: Keys) => peek(dependencies),
    preload: <Keys extends Tuple<unknown>, Fn extends (api: Return, ...keys: Keys) => Promise<unknown>>(
      callback: Fn,
      dependencies: Keys,
    ) => preload(async (...keys: Keys) => callback(await instanceApi, ...keys), dependencies),
  }
}
