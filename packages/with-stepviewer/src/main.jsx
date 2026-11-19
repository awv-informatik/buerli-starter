import './styles.css'

import { init, WASMClient } from '@classcad/client'
import { elements } from '@classcad/react'
import { Measure } from '@classcad/react-cad'
import { createRoot } from 'react-dom/client'

import App from './App'

// A public access token (ccpk_…) from https://classcad.ch/account#tokens, see https://sdkjs.classcad.ch/docs/quickstart/wasm
// For a native engine, use WSClient or SocketIOClient instead: https://sdkjs.classcad.ch/docs/quickstart/native
const token = ''
init(did => new WASMClient(did, { token }), { globalPlugins: [Measure], elements })

createRoot(document.getElementById('root')).render(<App />)
