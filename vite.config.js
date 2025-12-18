/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv('', process.cwd(), '')

  return defineConfig({
    define: {
      'CLASSCAD_WASM_KEY': JSON.stringify(env.CLASSCAD_WASM_KEY ?? ''),
      'SOCKETIO_URL': JSON.stringify(env.SOCKETIO_URL ?? ''),
    },
    plugins: [react()],
    server: {
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
      },
    },
  })
}
