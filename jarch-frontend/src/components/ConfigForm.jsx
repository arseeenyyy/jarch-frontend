import React from 'react';

const buildTools = ['MAVEN', 'GRADLE'];
const dbTypes = ['POSTGRESQL', 'MYSQL', 'H2', 'ORACLE'];
const propertyFormats = ['YAML', 'PROPERTIES'];

export const ConfigForm = ({ config, onChange }) => {
    const updateField = (field, value) => {
        onChange({ ...config, [field]: value });
    };

    const updateDatabaseField = (field, value) => {
        onChange({
            ...config,
            database: {
                ...config.database,
                [field]: value
            }
        });
    };

    return (
        <div className="config-form">
            <div className="form-section">
                <h3>Основные настройки</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Базовый пакет:</label>
                        <input
                            type="text"
                            value={config.basePackage || ''}
                            onChange={(e) => updateField('basePackage', e.target.value)}
                            placeholder="com.example.app"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Название приложения:</label>
                        <input
                            type="text"
                            value={config.applicationName || ''}
                            onChange={(e) => updateField('applicationName', e.target.value)}
                            placeholder="My Application"
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Сборщик:</label>
                        <select
                            value={config.buildTool || 'MAVEN'}
                            onChange={(e) => updateField('buildTool', e.target.value)}
                        >
                            {buildTools.map(tool => (
                                <option key={tool} value={tool}>{tool}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Формат конфигурации:</label>
                        <select
                            value={config.propertiesFormat || 'YAML'}
                            onChange={(e) => updateField('propertiesFormat', e.target.value)}
                        >
                            {propertyFormats.map(format => (
                                <option key={format} value={format}>{format}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Порт сервера:</label>
                        <input
                            type="number"
                            value={config.serverPort || 8080}
                            onChange={(e) => updateField('serverPort', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Настройки базы данных</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Тип БД:</label>
                        <select
                            value={config.database?.type || 'POSTGRESQL'}
                            onChange={(e) => updateDatabaseField('type', e.target.value)}
                        >
                            {dbTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Хост:</label>
                        <input
                            type="text"
                            value={config.database?.host || ''}
                            onChange={(e) => updateDatabaseField('host', e.target.value)}
                            placeholder="localhost"
                        />
                    </div>

                    <div className="form-group">
                        <label>Порт:</label>
                        <input
                            type="number"
                            value={config.database?.port || ''}
                            onChange={(e) => updateDatabaseField('port', parseInt(e.target.value))}
                            placeholder="5432"
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Имя базы данных:</label>
                        <input
                            type="text"
                            value={config.database?.databaseName || ''}
                            onChange={(e) => updateDatabaseField('databaseName', e.target.value)}
                            placeholder="mydatabase"
                        />
                    </div>

                    <div className="form-group">
                        <label>Пользователь:</label>
                        <input
                            type="text"
                            value={config.database?.username || ''}
                            onChange={(e) => updateDatabaseField('username', e.target.value)}
                            placeholder="postgres"
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={config.database?.password || ''}
                            onChange={(e) => updateDatabaseField('password', e.target.value)}
                            placeholder="password"
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>DDL Auto:</label>
                        <select
                            value={config.database?.ddlAuto || 'update'}
                            onChange={(e) => updateDatabaseField('ddlAuto', e.target.value)}
                        >
                            <option value="none">none</option>
                            <option value="validate">validate</option>
                            <option value="update">update</option>
                            <option value="create">create</option>
                            <option value="create-drop">create-drop</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pool Size:</label>
                        <input
                            type="number"
                            value={config.database?.poolSize || 15}
                            onChange={(e) => updateDatabaseField('poolSize', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};