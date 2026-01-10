import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
export { authService } from './services/authService';
export { projectService } from './services/projectService';
export { teamService } from './services/teamService';
export { saveService } from './services/saveService';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);