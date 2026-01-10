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

        // Проверка обязательных полей для app-config
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

        // Проверка для entity-config
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
                <h1>⚙️ Конструктор конфигураций Spring Boot</h1>
                <p className="subtitle">
                    Редактируйте конфигурации Spring Boot приложения. Ключи нельзя редактировать, только значения.
                </p>
            </div>

            {/* Табы для переключения между конфигурациями */}
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
                    📥 Скачать {activeTab === 'app' ? 'app-config.json' : 'entity-config.json'}
                </button>
                
                <button 
                    onClick={copyToClipboard}
                    className="action-btn secondary"
                    disabled={activeTab === 'app' ? !appConfig : !entityConfig}
                >
                    📋 Копировать JSON
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

            <div className="info-section">
                {activeTab === 'app' ? (
                    <>
                        <div className="info-card">
                            <h3>🎯 Особенности редактора app-config:</h3>
                            <ul>
                                <li>Ключи защищены от редактирования и удаления</li>
                                <li>Новые поля нельзя добавить</li>
                                <li>Валидация значений в реальном времени</li>
                                <li>Ограниченные наборы значений для полей</li>
                                <li>Скачивание только валидных конфигураций</li>
                            </ul>
                        </div>
                        
                        <div className="info-card">
                            <h3>📋 Быстрые клавиши:</h3>
                            <ul>
                                <li><strong>Double-click</strong> - редактировать значение</li>
                                <li><strong>Enter</strong> - подтвердить редактирование</li>
                                <li><strong>Escape</strong> - отменить редактирование</li>
                                <li><strong>Tab</strong> - перейти к следующему полю</li>
                                <li><strong>Shift+Tab</strong> - перейти к предыдущему полю</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="info-card">
                            <h3>🎯 Особенности редактора entity-config:</h3>
                            <ul>
                                <li>Добавление сущностей через кнопки</li>
                                <li>Добавление полей с отношениями или без</li>
                                <li>Управление сущностями через интерфейс</li>
                                <li>Валидация обязательных полей</li>
                                <li>JSON-редактор для точной настройки</li>
                            </ul>
                        </div>
                        
                        <div className="info-card">
                            <h3>📋 Возможности сущностей:</h3>
                            <ul>
                                <li><strong>Обычные поля:</strong> строки, числа, даты, булевы значения</li>
                                <li><strong>Поля с отношениями:</strong> связь между сущностями</li>
                                <li><strong>Типы отношений:</strong> ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY</li>
                                <li><strong>Fetch Type:</strong> LAZY (ленивая) или EAGER (жадная) загрузка</li>
                                <li><strong>Cascade Type:</strong> операции каскадирования</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AppConfigBuilderPage;