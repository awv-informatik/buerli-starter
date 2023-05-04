import { createRoot } from 'react-dom/client'
import './styles.css'
import { Leva } from 'leva'
import { App } from './App'
import { Out } from './components/Pending'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Leva neverHide titleBar={{ title: <Out /> }} />
  </>,
)
