import React, { useState } from 'react';
import Layout from './components/Layout';
import GenerationPage from './pages/GenerationPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import SavesPage from './pages/SavesPage';
import DownloadsPage from './pages/DownloadsPage';
import AppConfigBuilderPage from './pages/AppConfigBuilderPage';
import { authService } from './services/authService';

function MainApp() {
    const [activeTab, setActiveTab] = useState('generation');

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
            case 'team':
                return <TeamPage />;
            case 'saves':
                return <SavesPage />;
            case 'downloads':
                return <DownloadsPage />;
            case 'app-config': 
                return <AppConfigBuilderPage />;
            default:
                return <GenerationPage />;
        }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderTabContent()}
            <button onClick={handleLogout} style={{ position: 'fixed', top: '10px', right: '10px' }}>
                Выйти
            </button>
        </Layout>
    );
}

export default MainApp;