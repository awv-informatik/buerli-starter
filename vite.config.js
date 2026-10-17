import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv('', process.cwd(), '')
  if (env.CLASSCAD_PUBLIC_TOKEN?.startsWith('ccsk_')) {
    throw new Error(
      'CLASSCAD_PUBLIC_TOKEN is a secret access token (ccsk_…). A page takes a public one (ccpk_…); the secret token stays with a native engine.',
    )
  }

  return defineConfig({
    define: {
      CLASSCAD_PUBLIC_TOKEN: JSON.stringify(env.CLASSCAD_PUBLIC_TOKEN ?? ''),
      WS_URL: JSON.stringify(env.WS_URL ?? ''),
      SOCKETIO_URL: JSON.stringify(env.SOCKETIO_URL ?? ''),
    },
    build: {
      outDir: './build',
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
