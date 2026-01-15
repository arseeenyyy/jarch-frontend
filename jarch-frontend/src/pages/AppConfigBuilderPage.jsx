import React, { useState } from 'react';
import AppConfigEditor from '../components/AppConfigEditor';
import EntityConfigEditor from '../components/EntityConfigEditor';

const AppConfigBuilderPage = () => {
    const [appConfig, setAppConfig] = useState(null);
    const [entityConfig, setEntityConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('app');

    const handleAppConfigChange = (newConfig) => {
        setAppConfig(newConfig);
    };

    const handleEntityConfigChange = (newConfig) => {
        setEntityConfig(newConfig);
    };

    const downloadConfig = () => {
        let configToDownload;
        let filename;
        
        if (activeTab === 'app' && appConfig) {
            configToDownload = appConfig;
            filename = 'app-config.json';
        } else if (activeTab === 'entity' && entityConfig) {
            configToDownload = entityConfig;
            filename = 'entity-config.json';
        } else {
            return;
        }

        const blob = new Blob([JSON.stringify(configToDownload, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="config-builder-page">
            <div className="config-builder-controls">
                <button 
                    onClick={() => setActiveTab('app')}
                    className={activeTab === 'app' ? 'active' : ''}
                >
                    [app-config.json]
                </button>
                <button 
                    onClick={() => setActiveTab('entity')}
                    className={activeTab === 'entity' ? 'active' : ''}
                >
                    [entity-config.json]
                </button>
            </div>

            <div className="download-button-container">
                <button 
                    onClick={downloadConfig}
                    disabled={activeTab === 'app' ? !appConfig : !entityConfig}
                    className="download-button"
                >
                    [Скачать {activeTab === 'app' ? 'app-config.json' : 'entity-config.json'}]
                </button>
            </div>

            <div className="json-editor-container">
                {activeTab === 'app' ? (
                    <div className="json-editor-wrapper">
                        <AppConfigEditor onChange={handleAppConfigChange} />
                    </div>
                ) : (
                    <div className="json-editor-wrapper">
                        <EntityConfigEditor onChange={handleEntityConfigChange} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppConfigBuilderPage;