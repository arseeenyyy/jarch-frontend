import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

// Начальная конфигурация
const initialConfig = {
    basePackage: "",
    applicationName: "",
    buildTool: "",
    propertiesFormat: "",
    serverPort: 0,
    database: {
        type: "",
        host: "",
        port: 0,
        databaseName: "",
        username: "",
        password: "",
        ddlAuto: "",
        poolSize: 0
    }
};

const AppConfigEditor = ({ onChange }) => {
    const [config, setConfig] = useState(initialConfig);
    const [errors, setErrors] = useState({});

    // При изменении конфигурации
    const handleConfigChange = (newConfig) => {
        setConfig(newConfig);
        
        // Валидация
        const validationErrors = {};
        
        // Проверяем обязательные поля
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
        
        requiredFields.forEach(field => {
            const value = field.includes('.') 
                ? field.split('.').reduce((obj, key) => obj?.[key], newConfig)
                : newConfig[field];
            
            if (!value && value !== 0) {
                validationErrors[field] = 'Обязательное поле';
            }
        });
        
        // Проверка числовых полей
        ['serverPort', 'database.port', 'database.poolSize'].forEach(field => {
            const value = field.includes('.') 
                ? field.split('.').reduce((obj, key) => obj?.[key], newConfig)
                : newConfig[field];
            
            if (value !== 0 && (!value || isNaN(value))) {
                validationErrors[field] = 'Должно быть числом';
            }
            
            if (field === 'serverPort' && (value < 1024 || value > 65535)) {
                validationErrors[field] = 'Порт должен быть 1024-65535';
            }
            
            if (field === 'database.port' && (value < 1 || value > 65535)) {
                validationErrors[field] = 'Порт БД должен быть 1-65535';
            }
            
            if (field === 'database.poolSize' && (value < 1 || value > 100)) {
                validationErrors[field] = 'Размер пула должен быть 1-100';
            }
        });
        
        setErrors(validationErrors);
        
        // Если ошибок нет, вызываем onChange
        if (Object.keys(validationErrors).length === 0 && onChange) {
            onChange(newConfig);
        }
    };

    // Функция для создания вариантов enum
    const getEnumOptions = (path) => {
        const fieldPath = path ? path.join('.') : '';
        
        switch(fieldPath) {
            case 'buildTool':
                return ["MAVEN", "GRADLE"];
            case 'propertiesFormat':
                return ["YAML", "PROPERTIES"];
            case 'database.type':
                return ["POSTGRESQL", "MYSQL", "H2", "ORACLE", "MONGODB"];
            case 'database.ddlAuto':
                return ["none", "validate", "update", "create", "create-drop"];
            default:
                return null;
        }
    };

    // Кастомная функция для обработки обновлений
    const handleUpdate = ({ newData, newValue, path }) => {
        // Проверяем enum значения
        if (path && path.length > 0) {
            const fieldPath = path.join('.');
            const enumOptions = getEnumOptions(path);
            
            if (enumOptions && !enumOptions.includes(newValue)) {
                setErrors(prev => ({
                    ...prev,
                    [fieldPath]: `Допустимые значения: ${enumOptions.join(', ')}`
                }));
                return false;
            }
        }
        
        handleConfigChange(newData);
        return true;
    };

    // Заполнение примером
    const fillExample = () => {
        const exampleConfig = {
            basePackage: "com.ecommerce.app",
            applicationName: "E-Commerce Application",
            buildTool: "MAVEN",
            propertiesFormat: "YAML",
            serverPort: 8080,
            database: {
                type: "POSTGRESQL",
                host: "localhost",
                port: 5432,
                databaseName: "postgres",
                username: "root",
                password: "123",
                ddlAuto: "update",
                poolSize: 15
            }
        };
        setConfig(exampleConfig);
        handleConfigChange(exampleConfig);
    };

    // Сброс
    const resetConfig = () => {
        setConfig(initialConfig);
        setErrors({});
        if (onChange) onChange(initialConfig);
    };

    return (
        <div className="app-config-editor">
            <div className="editor-header">
                <h3>app-config.json</h3>
                <div className="header-actions">
                    <button onClick={fillExample} className="action-btn example-btn">
                        Заполнить примером
                    </button>
                    <button onClick={resetConfig} className="action-btn reset-btn">
                        Очистить
                    </button>
                </div>
            </div>

            <div className="editor-content">
                <div className="json-editor-wrapper">
                    <JsonEditor
                        data={config}
                        setData={handleConfigChange}
                        onUpdate={handleUpdate}
                        onError={({ error, path }) => {
                            console.error('Error:', error, 'at path:', path);
                            return false;
                        }}
                        // Разрешаем редактирование, но ограничиваем типы
                        restrictEdit={() => false}
                        restrictDelete={() => true}
                        restrictAdd={() => true}
                        restrictDrag={() => true}
                        // Позволяем выбирать только определенные типы для разных полей
                        restrictTypeSelection={(node) => {
                            const path = node.path ? node.path.join('.') : '';
                            
                            // Определяем доступные типы для каждого поля
                            if (['serverPort', 'database.port', 'database.poolSize'].includes(path)) {
                                return ['number'];
                            }
                            
                            // Для enum полей разрешаем только строку
                            if (['buildTool', 'propertiesFormat', 'database.type', 'database.ddlAuto'].includes(path)) {
                                return ['string'];
                            }
                            
                            // Для обычных строковых полей
                            if (['basePackage', 'applicationName', 'database.host', 
                                 'database.databaseName', 'database.username', 'database.password'].includes(path)) {
                                return ['string'];
                            }
                            
                            return false;
                        }}
                        // Используем кастомные опции для новых ключей
                        newKeyOptions={() => []}
                        // Отображаем селектор типов
                        showTypesSelector={true}
                        // Кастомные значения по умолчанию
                        defaultValue={(node, newKey) => {
                            // Устанавливаем значения по умолчанию для enum полей
                            switch(newKey) {
                                case 'buildTool':
                                    return 'MAVEN';
                                case 'propertiesFormat':
                                    return 'YAML';
                                case 'type':
                                    if (node.path && node.path[node.path.length - 1] === 'database') {
                                        return 'POSTGRESQL';
                                    }
                                    break;
                                case 'ddlAuto':
                                    if (node.path && node.path[node.path.length - 1] === 'database') {
                                        return 'update';
                                    }
                                    break;
                            }
                            return '';
                        }}
                        icons={{
                            add: <span />,
                            edit: <span>✏️</span>,
                            delete: <span />,
                            copy: <span>📋</span>,
                            ok: <span>✓</span>,
                            cancel: <span>✗</span>,
                            chevron: <span>▶</span>
                        }}
                        translations={{
                            KEY_NEW: 'Новый ключ',
                            KEY_SELECT: 'Выберите ключ',
                            NO_KEY_OPTIONS: 'Нет доступных ключей',
                            ERROR_KEY_EXISTS: 'Ключ уже существует',
                            ERROR_INVALID_JSON: 'Неверный JSON',
                            DEFAULT_STRING: 'Новые данные!',
                            DEFAULT_NEW_KEY: 'ключ',
                            EMPTY_STRING: '<пустая строка>',
                            TOOLTIP_COPY: 'Копировать',
                            TOOLTIP_EDIT: 'Редактировать',
                            TOOLTIP_DELETE: '',
                            TOOLTIP_ADD: ''
                        }}
                    />
                </div>

                <div className="validation-panel">
                    <h4>Валидация</h4>
                    
                    {Object.keys(errors).length === 0 ? (
                        <div className="validation-success">
                            ✅ Конфигурация валидна
                        </div>
                    ) : (
                        <div className="validation-errors">
                            <h5>Ошибки:</h5>
                            {Object.entries(errors).map(([field, error]) => (
                                <div key={field} className="error-item">
                                    <span className="error-field">{field}:</span>
                                    <span className="error-message">{error}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="field-info">
                        <h5>Типы данных полей:</h5>
                        <ul>
                            <li><strong>serverPort, port, poolSize:</strong> только число</li>
                            <li><strong>basePackage, applicationName:</strong> только строка</li>
                            <li><strong>buildTool:</strong> MAVEN | GRADLE</li>
                            <li><strong>propertiesFormat:</strong> YAML | PROPERTIES</li>
                            <li><strong>database.type:</strong> POSTGRESQL | MYSQL | H2 | ORACLE | MONGODB</li>
                            <li><strong>database.ddlAuto:</strong> none | validate | update | create | create-drop</li>
                        </ul>
                        <p><em>Для полей с enum значениями при редактировании будут доступны соответствующие опции</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppConfigEditor;