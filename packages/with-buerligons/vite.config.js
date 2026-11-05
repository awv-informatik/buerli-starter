import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // One React for the app and its dependencies: tunnel-rat's zustand 4 brings React 18 along
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 3000 },
})
