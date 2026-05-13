import { createRoot } from 'react-dom/client'
import { init, WASMClient } from '@buerli.io/classcad'
import './styles.css'
import App from './App'

// Visit https://staging01.buerli.io/docs/quickstart/wasm to create your ClassCAD key
const classcadKey = ''
init((did: string) => new WASMClient(did, { classcadKey }))

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')
createRoot(container).render(<App />)
