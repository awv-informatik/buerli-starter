import { createRoot } from 'react-dom/client'
import { init, WASMClient } from '@buerli.io/classcad'
import 'antd/dist/reset.css'
import './styles.css'
import App from './App'

// A public access token (ccpk_…) from https://classcad.ch/account#tokens, see https://buerli.io/docs/quickstart/wasm
// For a native engine, use WSClient or SocketIOClient instead: https://buerli.io/docs/quickstart/native
const token = ''
init(did => new WASMClient(did, { token }))

createRoot(document.getElementById('root')).render(<App />)
