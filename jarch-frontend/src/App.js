import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import AuthPage from './pages/AuthPage';
import MainApp from './MainApp';
import './styles/main.css'

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };

        window.addEventListener('authChange', handleAuthChange);

        handleAuthChange();

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route 
                    path="/login" 
                    element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} 
                />
                <Route 
                    path="/*" 
                    element={isAuthenticated ? <MainApp /> : <Navigate to="/login" />} 
                />
            </Routes>
        </Router>
    );
};

export default App;