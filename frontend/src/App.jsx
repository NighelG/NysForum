import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Routing from './routes/Routing.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastProvider } from "./context/ToastContext"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <Routing />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App