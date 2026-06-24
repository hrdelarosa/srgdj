import { Toaster } from 'sonner'
import './App.css'
import { AppRouter } from './app/router'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App
