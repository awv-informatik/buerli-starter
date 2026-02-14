import { createRoot } from 'react-dom/client'
import { init, WASMClient } from '@buerli.io/classcad'
import './styles.css'
import App from './App'

const classcadKey = ''
init(did => new WASMClient(did, { classcadKey }))

createRoot(document.getElementById('root')).render(<App />)
