import React, { useState } from 'react';
import Layout from './components/Layout';
import GenerationPage from './pages/GenerationPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import SavesPage from './pages/SavesPage';
import DownloadsPage from './pages/DownloadsPage';
import AppConfigBuilderPage from './pages/AppConfigBuilderPage';
import { setToken } from './services/api';
import './styles/main.css';

function App() {
    const [activeTab, setActiveTab] = useState('generation');
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || '');

    React.useEffect(() => {
        setToken(jwtToken);
    }, [jwtToken]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'generation':
                return <GenerationPage jwtToken={jwtToken} setJwtToken={setJwtToken} />;
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
                return <GenerationPage jwtToken={jwtToken} setJwtToken={setJwtToken} />;
        }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderTabContent()}
        </Layout>
    );
}

export default App;