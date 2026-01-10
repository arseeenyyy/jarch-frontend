import React, { useState } from 'react';

const fieldTypes = ['String', 'Integer', 'Long', 'Double', 'Boolean', 'Float', 'LocalDate', 'LocalDateTime'];

export const EntityBuilder = ({ entity, onChange, onRemove, index, availableEntities }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const updateField = (field, value) => {
        onChange({ ...entity, [field]: value });
    };

    const addField = () => {
        const newField = {
            name: '',
            type: 'String',
            description: '',
            required: false
        };
        
        onChange({
            ...entity,
            fields: [...entity.fields, newField]
        });
    };

    const updateFieldAtIndex = (fieldIndex, field, value) => {
        const newFields = [...entity.fields];
        newFields[fieldIndex] = { ...newFields[fieldIndex], [field]: value };
        onChange({ ...entity, fields: newFields });
    };

    const removeField = (fieldIndex) => {
        if (entity.fields.length <= 1) return;
        const newFields = entity.fields.filter((_, i) => i !== fieldIndex);
        onChange({ ...entity, fields: newFields });
    };

    return (
        <div className="entity-builder-card">
            <div className="entity-header">
                <div className="entity-title">
                    <h4>{entity.name || `Сущность ${index + 1}`}</h4>
                    {entity.description && (
                        <p className="entity-description">{entity.description}</p>
                    )}
                </div>
                <button onClick={onRemove} className="remove-entity-btn">
                    ×
                </button>
            </div>

            <div className="entity-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Название сущности:</label>
                        <input
                            type="text"
                            value={entity.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="user, product, order..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Описание:</label>
                        <input
                            type="text"
                            value={entity.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Описание сущности..."
                        />
                    </div>
                </div>

                <div className="fields-section">
                    <div className="fields-header">
                        <h5>Поля сущности:</h5>
                        <button onClick={addField} className="add-field-btn">
                            + Добавить поле
                        </button>
                    </div>

                    <div className="fields-list">
                        {entity.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="field-row">
                                <input
                                    type="text"
                                    value={field.name}
                                    onChange={(e) => updateFieldAtIndex(fieldIndex, 'name', e.target.value)}
                                    placeholder="Имя поля"
                                    className="field-input"
                                />
                                <select
                                    value={field.type}
                                    onChange={(e) => updateFieldAtIndex(fieldIndex, 'type', e.target.value)}
                                    className="field-select"
                                >
                                    {fieldTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                    {availableEntities.map(entityName => (
                                        <option key={entityName} value={entityName}>
                                            {entityName}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={field.description}
                                    onChange={(e) => updateFieldAtIndex(fieldIndex, 'description', e.target.value)}
                                    placeholder="Описание"
                                    className="field-input"
                                />
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateFieldAtIndex(fieldIndex, 'required', e.target.checked)}
                                    />
                                    Обяз.
                                </label>
                                <button 
                                    onClick={() => removeField(fieldIndex)}
                                    className="remove-field-btn"
                                    disabled={entity.fields.length <= 1}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="advanced-toggle"
                >
                    {showAdvanced ? '▲' : '▼'} Дополнительные настройки
                </button>

                {showAdvanced && (
                    <div className="advanced-settings">
                        <div className="form-group">
                            <label>Таблица в БД:</label>
                            <input
                                type="text"
                                value={entity.tableName || entity.name?.toLowerCase() || ''}
                                onChange={(e) => updateField('tableName', e.target.value)}
                                placeholder="Имя таблицы (по умолчанию = имя сущности)"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};