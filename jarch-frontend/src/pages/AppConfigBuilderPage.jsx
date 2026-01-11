import React, { useState } from 'react';
import AppConfigEditor from '../components/AppConfigEditor';
import EntityConfigEditor from '../components/EntityConfigEditor';

const AppConfigBuilderPage = () => {
    const [appConfig, setAppConfig] = useState(null);
    const [entityConfig, setEntityConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('app'); // 'app' или 'entity'
    const [downloadReady, setDownloadReady] = useState(false);

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
            alert(`Сначала заполните ${activeTab === 'app' ? 'конфигурацию приложения' : 'конфигурацию сущностей'}!`);
            return;
        }

        if (activeTab === 'app') {
            const requiredFields = [
                'basePackage',
                'applicationName',
                'buildTool',
                'propertiesFormat',
                'serverPort',
                'database.type',
                'database.host',
                'database.port',
                'database.databaseName',
                'database.username'
            ];

            for (const field of requiredFields) {
                const value = field.includes('.') 
                    ? field.split('.').reduce((obj, key) => obj?.[key], configToDownload)
                    : configToDownload[field];
                
                if (!value && value !== 0) {
                    alert(`Поле ${field} не заполнено!`);
                    return;
                }
            }
        }

        if (activeTab === 'entity' && configToDownload.entities) {
            for (const entity of configToDownload.entities) {
                if (!entity.name) {
                    alert('У всех сущностей должно быть имя!');
                    return;
                }
                
                for (const field of entity.fields || []) {
                    if (!field.name || !field.type) {
                        alert('У всех полей должно быть имя и тип!');
                        return;
                    }
                }
            }
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
        
        setDownloadReady(true);
        setTimeout(() => setDownloadReady(false), 2000);
    };

    const copyToClipboard = async () => {
        let configToCopy;
        
        if (activeTab === 'app' && appConfig) {
            configToCopy = appConfig;
        } else if (activeTab === 'entity' && entityConfig) {
            configToCopy = entityConfig;
        } else {
            alert(`Сначала заполните ${activeTab === 'app' ? 'конфигурацию приложения' : 'конфигурацию сущностей'}!`);
            return;
        }

        try {
            await navigator.clipboard.writeText(JSON.stringify(configToCopy, null, 2));
            alert('Конфигурация скопирована в буфер обмена!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="app-config-builder-page">
            <div className="page-header">
                <p className="subtitle">
                </p>
            </div>

            <div className="config-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'app' ? 'active' : ''}`}
                    onClick={() => setActiveTab('app')}
                >
                    app-config.json
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'entity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entity')}
                >
                    entity-config.json
                </button>
            </div>

            <div className="page-actions">
                <button 
                    onClick={downloadConfig}
                    className="action-btn primary"
                    disabled={activeTab === 'app' ? !appConfig : !entityConfig}
                >
                    Скачать {activeTab === 'app' ? 'app-config.json' : 'entity-config.json'}
                </button>
                
                
                {downloadReady && (
                    <div className="success-message">
                        ✅ Файл успешно скачан!
                    </div>
                )}
            </div>

            <div className="editor-section">
                {activeTab === 'app' ? (
                    <AppConfigEditor onChange={handleAppConfigChange} />
                ) : (
                    <EntityConfigEditor onChange={handleEntityConfigChange} />
                )}
            </div>
        </div>
    );
};

export default AppConfigBuilderPage;