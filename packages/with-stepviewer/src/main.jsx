import './styles.css'

import { init, WASMClient } from '@buerli.io/classcad'
import { elements } from '@buerli.io/react'
import { Measure } from '@buerli.io/react-cad'
import { createRoot } from 'react-dom/client'

import App from './App'

// Visit https://staging01.buerli.io/docs/quickstart/wasm to create your ClassCAD key
const classcadKey = ''
init(did => new WASMClient(did, { classcadKey }), { globalPlugins: [Measure], elements })

createRoot(document.getElementById('root')).render(<App />)
