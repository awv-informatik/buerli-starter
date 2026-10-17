import './styles.css'

import { init, WASMClient } from '@buerli.io/classcad'
import { elements } from '@buerli.io/react'
import { Measure } from '@buerli.io/react-cad'
import { createRoot } from 'react-dom/client'

import App from './App'

// A public access token (ccpk_…) from https://classcad.ch/account#tokens, see https://buerli.io/docs/quickstart/wasm
// For a native engine, use WSClient or SocketIOClient instead: https://buerli.io/docs/quickstart/native
const token = ''
init(did => new WASMClient(did, { token }), { globalPlugins: [Measure], elements })

createRoot(document.getElementById('root')).render(<App />)
