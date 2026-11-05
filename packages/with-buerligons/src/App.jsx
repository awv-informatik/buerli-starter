import { useEffect } from 'react'
import { Buerligons, EditorController } from '@buerli.io/buerligons'
import clamp from './resources/Clamp.ofb?url'

// Opens, saves and closes the documents Buerligons edits
const editor = new EditorController()

export default function App() {
  useEffect(() => {
    // Load a part into the editor, and close it again when the app goes
    fetch(clamp)
      .then(res => res.arrayBuffer())
      .then(data => editor.open({ name: 'Clamp', format: 'OFB', data }))
      .catch(console.error)
    return () => void editor.close()
  }, [])
  // The whole CAD app, without its welcome page: the controller decides what is open
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Buerligons welcome={false} />
    </div>
  )
}
