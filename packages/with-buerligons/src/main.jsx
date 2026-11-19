import { createRoot } from 'react-dom/client'
import { init, WASMClient } from '@classcad/client'

import App from './App'

// A public access token (ccpk_…) from https://classcad.ch/account#tokens, see https://sdkjs.classcad.ch/docs/quickstart/wasm
// For a native engine, use WSClient or SocketIOClient instead: https://sdkjs.classcad.ch/docs/quickstart/native
const token = ''
init(did => new WASMClient(did, { token }))

createRoot(document.getElementById('root')).render(<App />)
