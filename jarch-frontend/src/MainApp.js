import React, { useState } from 'react';
import Layout from './components/Layout';
import GenerationPage from './pages/GenerationPage';
import ProjectsPage from './pages/ProjectsPage'; // Теперь здесь будут все подвкладки
import { authService } from './services/authService';

function MainApp() {
    const [activeTab, setActiveTab] = useState('projects');

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'generation':
                return <GenerationPage />;
            case 'projects':
                return <ProjectsPage />;
            default:
                return <ProjectsPage />;
        }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderTabContent()}
            <button onClick={handleLogout} className="logout-button">
                Выйти
            </button>
        </Layout>
    );
}

export default MainApp;