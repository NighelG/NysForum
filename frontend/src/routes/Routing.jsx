import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Forum from './pages/Forum';

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    user ? children : <Navigate to="/login" />;
};