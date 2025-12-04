import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Routing from './routes/Routing.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routing />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;