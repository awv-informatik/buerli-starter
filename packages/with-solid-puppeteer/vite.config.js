import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import arraybuffer from "vite-plugin-arraybuffer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), arraybuffer()],
})
