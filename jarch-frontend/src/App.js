import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import AuthPage from './pages/AuthPage';
import MainApp from './MainApp';

const App = () => {
    const isAuthenticated = authService.isAuthenticated();

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