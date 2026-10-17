/* eslint-env node */
import 'antd/dist/reset.css'
import './styles.css'

import { createRoot } from 'react-dom/client'
import { init, WASMClient, WSClient, SocketIOClient } from '@buerli.io/classcad'
import { elements } from '@buerli.io/react'
import { Measure } from '@buerli.io/react-cad'

import App from './App'

// Set in .env, see the README
// eslint-disable-next-line no-undef
const token = CLASSCAD_PUBLIC_TOKEN
// eslint-disable-next-line no-undef
const wsUrl = WS_URL
// eslint-disable-next-line no-undef
const socketIoUrl = SOCKETIO_URL

init(
  id => {
    if (token) return new WASMClient(id, { token })
    if (wsUrl) return new WSClient(wsUrl, id)
    if (socketIoUrl) return new SocketIOClient(socketIoUrl, id)
    throw new Error('No ClassCAD engine: set a public access token or a server address in .env (see the README)')
  },
  { globalPlugins: [Measure], elements },
)

createRoot(document.getElementById('root')).render(<App />)
