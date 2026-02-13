/* eslint-env node */
import 'antd/dist/antd.css'
import './styles.css'

import { createRoot } from 'react-dom/client'
import { init, WASMClient, SocketIOClient } from '@buerli.io/classcad'
import { elements } from '@buerli.io/react'
import { Measure } from '@buerli.io/react-cad'

import App from './App'

// eslint-disable-next-line no-undef
const classcadWasmKey = CLASSCAD_WASM_KEY
// eslint-disable-next-line no-undef
const socketIoUrl = SOCKETIO_URL

init(
  id => {
    if (classcadWasmKey) {
      return new WASMClient(id, { classcadKey: classcadWasmKey })
    } else {
      return new SocketIOClient(socketIoUrl, id)
    }
  },
  { globalPlugins: [Measure], elements },
)

createRoot(document.getElementById('root')).render(<App />)
