import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Routing from './routes/Routing.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;