import { createRoot } from 'react-dom/client'
import { init, WASMClient } from '@buerli.io/classcad'
import 'antd/dist/antd.css'
import './styles.css'
import App from './App'

// Visit https://staging01.buerli.io/docs/quickstart/wasm to create your ClassCAD key
const classcadKey = ''
init(did => new WASMClient(did, { classcadKey }))

createRoot(document.getElementById('root')).render(<App />)
