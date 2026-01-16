import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import GenerationPage from './pages/GenerationPage';
import ProjectsPage from './pages/ProjectsPage';
import { authService } from './services/authService';

function MainApp() {
    const [activeTab, setActiveTab] = useState('projects');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            }));
        };

        updateTime();
        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

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
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                {renderTabContent()}
            </Layout>
            
            {/* Панель с временем и кнопкой выхода в правом верхнем углу */}
            <div style={{ 
                position: 'fixed', 
                top: '20px', 
                right: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                background: 'rgba(26, 26, 34, 0.9)',
                padding: '8px 15px',
                border: '1px solid var(--color-border)',
                borderRadius: '2px',
                zIndex: 1000
            }}>
                <div style={{ 
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    <span>{currentTime}</span>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        color: 'var(--color-error)',
                        fontSize: '0.9rem',
                        padding: '4px 10px',
                        border: '1px solid var(--color-error)',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'rgba(255, 119, 119, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                    }}
                >
                    Выйти
                </button>
            </div>
        </div>
    );
}

export default MainApp;