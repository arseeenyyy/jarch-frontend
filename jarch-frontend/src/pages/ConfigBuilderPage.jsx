import React, { useState, useEffect } from 'react';
import { JSONEditor } from '../components/JsonEditor';
import { ConfigForm } from '../components/ConfigForm';
import { EntityBuilder } from '../components/EntityBuilder';

const ConfigBuilderPage = () => {
    const [appConfig, setAppConfig] = useState({
        basePackage: "com.example.app",
        applicationName: "My Spring Boot Application",
        buildTool: "MAVEN",
        propertiesFormat: "YAML",
        serverPort: 8080,
        database: {
            type: "POSTGRESQL",
            host: "localhost",
            port: 5432,
            databaseName: "mydb",
            username: "postgres",
            password: "password",
            ddlAuto: "update",
            poolSize: 15
        }
    });

    const [entityConfig, setEntityConfig] = useState({
        entities: [
            {
                name: "user",
                description: "User entity",
                fields: [
                    { name: "id", type: "Long", description: "Primary key", required: true },
                    { name: "username", type: "String", description: "Username", required: true },
                    { name: "email", type: "String", description: "Email", required: true },
                    { name: "password", type: "String", description: "Password", required: true }
                ]
            }
        ]
    });

    const [activeTab, setActiveTab] = useState('app'); // 'app', 'entity', 'preview'
    const [downloadReady, setDownloadReady] = useState(false);

    // Загрузка из localStorage при монтировании
    useEffect(() => {
        const savedAppConfig = localStorage.getItem('appConfig');
        const savedEntityConfig = localStorage.getItem('entityConfig');
        
        if (savedAppConfig) {
            try {
                setAppConfig(JSON.parse(savedAppConfig));
            } catch (e) {
                console.error('Failed to parse saved app config:', e);
            }
        }
        
        if (savedEntityConfig) {
            try {
                setEntityConfig(JSON.parse(savedEntityConfig));
            } catch (e) {
                console.error('Failed to parse saved entity config:', e);
            }
        }
    }, []);

    // Сохранение в localStorage при изменениях
    useEffect(() => {
        localStorage.setItem('appConfig', JSON.stringify(appConfig));
    }, [appConfig]);

    useEffect(() => {
        localStorage.setItem('entityConfig', JSON.stringify(entityConfig));
    }, [entityConfig]);

    // Обработчики для EntityBuilder
    const addEntity = () => {
        const newEntity = {
            name: "",
            description: "",
            fields: [
                { name: "id", type: "Long", description: "Primary key", required: true }
            ]
        };
        
        setEntityConfig(prev => ({
            ...prev,
            entities: [...prev.entities, newEntity]
        }));
    };

    const updateEntity = (index, updatedEntity) => {
        const newEntities = [...entityConfig.entities];
        newEntities[index] = updatedEntity;
        setEntityConfig(prev => ({ ...prev, entities: newEntities }));
    };

    const removeEntity = (index) => {
        const newEntities = entityConfig.entities.filter((_, i) => i !== index);
        setEntityConfig(prev => ({ ...prev, entities: newEntities }));
    };

    // Скачивание конфигураций
    const downloadConfigs = () => {
        // Создаем и скачиваем app-config.json
        const appConfigBlob = new Blob([JSON.stringify(appConfig, null, 2)], { type: 'application/json' });
        const appConfigUrl = URL.createObjectURL(appConfigBlob);
        const appConfigLink = document.createElement('a');
        appConfigLink.href = appConfigUrl;
        appConfigLink.download = 'app-config.json';
        document.body.appendChild(appConfigLink);
        appConfigLink.click();
        document.body.removeChild(appConfigLink);
        URL.revokeObjectURL(appConfigUrl);

        // Создаем и скачиваем entity-config.json
        const entityConfigBlob = new Blob([JSON.stringify(entityConfig, null, 2)], { type: 'application/json' });
        const entityConfigUrl = URL.createObjectURL(entityConfigBlob);
        const entityConfigLink = document.createElement('a');
        entityConfigLink.href = entityConfigUrl;
        entityConfigLink.download = 'entity-config.json';
        
        // Небольшая задержка для надежности
        setTimeout(() => {
            document.body.appendChild(entityConfigLink);
            entityConfigLink.click();
            document.body.removeChild(entityConfigLink);
            URL.revokeObjectURL(entityConfigUrl);
            
            setDownloadReady(true);
            setTimeout(() => setDownloadReady(false), 3000);
        }, 100);
    };

    // Сброс к шаблону
    const resetToTemplate = (template) => {
        if (template === 'ecommerce') {
            setAppConfig({
                basePackage: "com.ecommerce.app",
                applicationName: "E-Commerce Application",
                buildTool: "MAVEN",
                propertiesFormat: "YAML",
                serverPort: 8080,
                database: {
                    type: "POSTGRESQL",
                    host: "localhost",
                    port: 5432,
                    databaseName: "ecommerce_db",
                    username: "postgres",
                    password: "password",
                    ddlAuto: "update",
                    poolSize: 15
                }
            });

            setEntityConfig({
                entities: [
                    {
                        name: "user",
                        description: "User entity",
                        fields: [
                            { name: "id", type: "Long", description: "Primary key", required: true },
                            { name: "username", type: "String", description: "Username", required: true },
                            { name: "email", type: "String", description: "Email", required: true },
                            { name: "password", type: "String", description: "Password", required: true }
                        ]
                    },
                    {
                        name: "product",
                        description: "Product entity",
                        fields: [
                            { name: "id", type: "Long", description: "Primary key", required: true },
                            { name: "name", type: "String", description: "Product name", required: true },
                            { name: "description", type: "String", description: "Product description", required: false },
                            { name: "price", type: "Double", description: "Product price", required: true },
                            { name: "stock", type: "Integer", description: "Stock quantity", required: true }
                        ]
                    }
                ]
            });
        }
        // Можно добавить другие шаблоны
    };

    return (
        <div className="config-builder-page">
            <div className="builder-header">
                <h1>🧱 Конструктор конфигураций</h1>
                <p className="subtitle">Создайте конфигурационные файлы для Spring Boot проекта</p>
            </div>

            <div className="builder-tabs">
                <button 
                    className={`tab ${activeTab === 'app' ? 'active' : ''}`}
                    onClick={() => setActiveTab('app')}
                >
                    ⚙️ Конфигурация приложения
                </button>
                <button 
                    className={`tab ${activeTab === 'entity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entity')}
                >
                    🗃️ Сущности
                </button>
                <button 
                    className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    👁️ Предпросмотр
                </button>
            </div>

            <div className="builder-content">
                {activeTab === 'app' && (
                    <div className="config-section">
                        <ConfigForm 
                            config={appConfig} 
                            onChange={setAppConfig} 
                        />
                    </div>
                )}

                {activeTab === 'entity' && (
                    <div className="config-section">
                        <div className="entities-header">
                            <h3>Сущности базы данных</h3>
                            <button onClick={addEntity} className="add-entity-btn">
                                + Добавить сущность
                            </button>
                        </div>

                        <div className="entities-list">
                            {entityConfig.entities.map((entity, index) => (
                                <EntityBuilder
                                    key={index}
                                    entity={entity}
                                    onChange={(updated) => updateEntity(index, updated)}
                                    onRemove={() => removeEntity(index)}
                                    index={index}
                                    availableEntities={entityConfig.entities.map(e => e.name).filter(name => name !== entity.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="preview-section">
                        <div className="preview-grid">
                            <div className="preview-card">
                                <h3>app-config.json</h3>
                                <JSONEditor 
                                    json={appConfig}
                                    onChange={setAppConfig}
                                    height={300}
                                />
                            </div>
                            <div className="preview-card">
                                <h3>entity-config.json</h3>
                                <JSONEditor 
                                    json={entityConfig}
                                    onChange={setEntityConfig}
                                    height={300}
                                />
                            </div>
                        </div>

                        <div className="stats-card">
                            <h4>📊 Статистика</h4>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Сущностей:</span>
                                    <span className="stat-value">{entityConfig.entities.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Всего полей:</span>
                                    <span className="stat-value">
                                        {entityConfig.entities.reduce((total, entity) => total + entity.fields.length, 0)}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">БД:</span>
                                    <span className="stat-value">{appConfig.database.type}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Порт:</span>
                                    <span className="stat-value">{appConfig.serverPort}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="builder-footer">
                <div className="templates-section">
                    <h4>Быстрые шаблоны:</h4>
                    <div className="templates-grid">
                        <button 
                            onClick={() => resetToTemplate('ecommerce')}
                            className="template-btn"
                        >
                            🛒 E-commerce
                        </button>
                        <button className="template-btn" disabled>
                            📝 Блог (скоро)
                        </button>
                        <button className="template-btn" disabled>
                            📊 CRM (скоро)
                        </button>
                    </div>
                </div>

                <div className="actions-section">
                    {downloadReady && (
                        <div className="success-message">
                            ✅ Конфигурации скачаны!
                        </div>
                    )}
                    
                    <button 
                        onClick={downloadConfigs}
                        className="download-btn"
                    >
                        📥 Скачать JSON файлы
                    </button>
                    
                    <p className="hint">
                        После скачивания загрузите файлы на вкладке "Генерация проекта"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfigBuilderPage;