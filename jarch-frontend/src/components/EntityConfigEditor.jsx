import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

// Начальная конфигурация сущностей
const initialEntityConfig = {
    entities: []
};

// Типы полей для выпадающего списка
const fieldTypes = [
    "String", "Integer", "Long", "Double", "Float", "Boolean", 
    "LocalDate", "LocalDateTime", "LocalTime", "BigDecimal"
];

// Типы отношений
const relationTypes = [
    "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE", "MANY_TO_MANY"
];

// Типы fetch
const fetchTypes = ["LAZY", "EAGER"];

// Типы cascade
const cascadeTypes = [
    "PERSIST", "MERGE", "REMOVE", "REFRESH", "DETACH", "ALL"
];

const EntityConfigEditor = ({ onChange }) => {
    const [config, setConfig] = useState(initialEntityConfig);
    const [errors, setErrors] = useState({});

    // При изменении конфигурации
    const handleConfigChange = (newConfig) => {
        setConfig(newConfig);
        
        // Валидация
        const validationErrors = {};
        
        // Проверяем, что у всех сущностей есть name
        newConfig.entities.forEach((entity, index) => {
            if (!entity.name) {
                validationErrors[`entities[${index}].name`] = 'Имя сущности обязательно';
            }
            
            // Проверяем поля сущности
            entity.fields?.forEach((field, fieldIndex) => {
                if (!field.name) {
                    validationErrors[`entities[${index}].fields[${fieldIndex}].name`] = 'Имя поля обязательно';
                }
                if (!field.type) {
                    validationErrors[`entities[${index}].fields[${fieldIndex}].type`] = 'Тип поля обязателен';
                }
            });
        });
        
        setErrors(validationErrors);
        
        // Если ошибок нет, вызываем onChange
        if (Object.keys(validationErrors).length === 0 && onChange) {
            onChange(newConfig);
        }
    };

    // Добавить новую сущность
    const addEntity = () => {
        const newEntity = {
            name: "",
            description: "",
            fields: []
        };
        
        const newConfig = {
            ...config,
            entities: [...config.entities, newEntity]
        };
        
        handleConfigChange(newConfig);
    };

    // Удалить сущность
    const removeEntity = (index) => {
        const newEntities = [...config.entities];
        newEntities.splice(index, 1);
        
        const newConfig = {
            ...config,
            entities: newEntities
        };
        
        handleConfigChange(newConfig);
    };

    // Добавить поле к сущности
    const addFieldToEntity = (entityIndex, isRelation = false) => {
        const newEntities = [...config.entities];
        
        const newField = {
            name: "",
            type: "",
            description: "",
            required: false
        };
        
        if (isRelation) {
            newField.relation = {
                type: "MANY_TO_ONE",
                targetEntity: "",
                fetchType: "LAZY",
                cascadeType: "PERSIST"
            };
        }
        
        newEntities[entityIndex].fields = [
            ...(newEntities[entityIndex].fields || []),
            newField
        ];
        
        const newConfig = {
            ...config,
            entities: newEntities
        };
        
        handleConfigChange(newConfig);
    };

    // Удалить поле из сущности
    const removeFieldFromEntity = (entityIndex, fieldIndex) => {
        const newEntities = [...config.entities];
        newEntities[entityIndex].fields.splice(fieldIndex, 1);
        
        const newConfig = {
            ...config,
            entities: newEntities
        };
        
        handleConfigChange(newConfig);
    };

    // Заполнить примером
    const fillExample = () => {
        const exampleConfig = {
            entities: [
                {
                    name: "userApp",
                    description: "User entity representing system users",
                    fields: [
                        {
                            name: "username",
                            type: "String",
                            description: "Unique username",
                            required: true
                        },
                        {
                            name: "email",
                            type: "String",
                            description: "User email address",
                            required: true
                        }
                    ]
                },
                {
                    name: "product",
                    description: "Product entity for e-commerce",
                    fields: [
                        {
                            name: "name",
                            type: "String",
                            description: "Product name",
                            required: true
                        },
                        {
                            name: "price",
                            type: "Double",
                            description: "Product price",
                            required: true
                        }
                    ]
                }
            ]
        };
        setConfig(exampleConfig);
        handleConfigChange(exampleConfig);
    };

    // Сброс
    const resetConfig = () => {
        setConfig(initialEntityConfig);
        setErrors({});
        if (onChange) onChange(initialEntityConfig);
    };

    // Обработчик обновления JSON
    const handleUpdate = ({ newData }) => {
        handleConfigChange(newData);
        return true;
    };

    return (
        <div className="entity-config-editor">
            <div className="editor-header">
                <h3>entity-config.json</h3>
                <div className="header-actions">
                    <button onClick={addEntity} className="action-btn add-btn">
                        ➕ Добавить сущность
                    </button>
                    <button onClick={fillExample} className="action-btn example-btn">
                        📋 Заполнить примером
                    </button>
                    <button onClick={resetConfig} className="action-btn reset-btn">
                        🗑️ Очистить
                    </button>
                </div>
            </div>

            {/* Ручное управление сущностями */}
            <div className="entities-manual-control">
                {config.entities.map((entity, entityIndex) => (
                    <div key={entityIndex} className="entity-card">
                        <div className="entity-card-header">
                            <h4>
                                Сущность #{entityIndex + 1}: 
                                <span className="entity-name">
                                    {entity.name || "Без имени"}
                                </span>
                            </h4>
                            <button 
                                onClick={() => removeEntity(entityIndex)}
                                className="remove-btn"
                            >
                                ✖ Удалить
                            </button>
                        </div>
                        
                        <div className="entity-controls">
                            <button 
                                onClick={() => addFieldToEntity(entityIndex, false)}
                                className="action-btn small-btn"
                            >
                                ➕ Обычное поле
                            </button>
                            <button 
                                onClick={() => addFieldToEntity(entityIndex, true)}
                                className="action-btn small-btn relation-btn"
                            >
                                🔗 Поле с отношением
                            </button>
                            
                            <div className="fields-list">
                                {entity.fields?.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="field-item">
                                        <span className="field-name">
                                            {field.name || "Без имени"} ({field.type || "Без типа"})
                                        </span>
                                        <button 
                                            onClick={() => removeFieldFromEntity(entityIndex, fieldIndex)}
                                            className="remove-field-btn"
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
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
                        // Разрешаем редактирование значений
                        restrictEdit={() => false}
                        // Запрещаем удаление и добавление через JSON редактор
                        restrictDelete={() => true}
                        restrictAdd={() => true}
                        restrictDrag={() => true}
                        // Скрываем селектор типов
                        showTypesSelector={false}
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
                        <h5>Справка по типам полей:</h5>
                        <ul>
                            <li><strong>String:</strong> Строка текста</li>
                            <li><strong>Integer/Long:</strong> Целые числа</li>
                            <li><strong>Double/Float:</strong> Числа с плавающей точкой</li>
                            <li><strong>Boolean:</strong> Логическое значение (true/false)</li>
                            <li><strong>LocalDate/LocalDateTime:</strong> Дата и время</li>
                        </ul>
                        
                        <h5>Типы отношений:</h5>
                        <ul>
                            <li><strong>ONE_TO_ONE:</strong> Один к одному</li>
                            <li><strong>ONE_TO_MANY:</strong> Один ко многим</li>
                            <li><strong>MANY_TO_ONE:</strong> Многие к одному</li>
                            <li><strong>MANY_TO_MANY:</strong> Многие ко многим</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntityConfigEditor;