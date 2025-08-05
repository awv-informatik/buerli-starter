import BarLoader from 'react-spinners/BarLoader'
import create from 'tunnel-rat'

// Create a tunnel that can be used to write into the DOM from within the canvas
const tunnel = create()

export const Out = () => (
  <div style={{ position: 'relative', maxWidth: 200, overflow: 'hidden', color: 'white', display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
    <tunnel.Out />
  </div>
)

export const Status = ({ children }) => (
  <tunnel.In>
    {children} <BarLoader size={10} cssOverride={{ marginLeft: 10, display: 'inline' }} color="white" />
  </tunnel.In>
)
