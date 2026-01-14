import React, { useState, useEffect } from 'react';
import { JsonEditor } from 'json-edit-react';
import customJsonEditorTheme from './JsonTheme';

const EntityConfigEditor = ({ onChange, onValidationChange }) => {
    const [data, setData] = useState({
        entities: []
    });
    
    const [errors, setErrors] = useState([]);
    const [entityNames, setEntityNames] = useState([]);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const names = data.entities
            .map(entity => entity.name?.trim())
            .filter(name => name && name.length > 0);
        setEntityNames(names);
        
        const validationErrors = validateConfig(data);
        const newIsValid = validationErrors.length === 0;
        setIsValid(newIsValid);
        setErrors(validationErrors);
        
        if (onValidationChange) {
            onValidationChange(newIsValid, validationErrors);
        }
    }, [data]);

    const fieldTypesEnum = {
        enum: "Field Type",
        values: ["String", "Integer", "Long", "Double", "Float", "Boolean", "LocalDate", "LocalDateTime", "LocalTime", "BigDecimal"],
        matchPriority: 1
    };

    const relationTypesEnum = {
        enum: "Relation Type",
        values: ["ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE", "MANY_TO_MANY"],
        matchPriority: 1
    };

    const fetchTypesEnum = {
        enum: "Fetch Type",
        values: ["LAZY", "EAGER"],
        matchPriority: 1
    };

    const cascadeTypesEnum = {
        enum: "Cascade Type",
        values: ["PERSIST", "MERGE", "REMOVE", "REFRESH", "DETACH", "ALL"],
        matchPriority: 1
    };

    const normalizeString = (str) => {
        if (!str) return '';
        return str.replace(/\s+/g, ' ').trim();
    };

    const parseComplexType = (typeString, hasRelation = false) => {
        if (!typeString) return { isValid: false, error: 'Тип не указан' };
        
        const normalizedType = normalizeString(typeString);
        
        const basicTypes = ["String", "Integer", "Long", "Double", "Float", "Boolean", 
                           "LocalDate", "LocalDateTime", "LocalTime", "BigDecimal"];
        
        if (!hasRelation) {
            if (basicTypes.includes(normalizedType)) {
                return { isValid: true, type: 'basic', value: normalizedType };
            } else {
                return { 
                    isValid: false, 
                    error: `Некорректный тип "${normalizedType}". Для простых полей допустимы только: ${basicTypes.join(', ')}` 
                };
            }
        }
        
        if (basicTypes.includes(normalizedType)) {
            return { isValid: true, type: 'basic', value: normalizedType };
        }
        
        if (entityNames.includes(normalizedType)) {
            return { isValid: true, type: 'entity', value: normalizedType };
        }
        
        const genericMatch = normalizedType.match(/^(\w+)<(.+)>$/);
        if (genericMatch) {
            const [_, containerType, innerTypeStr] = genericMatch;
            const containerTypes = ["List", "Set", "Collection", "ArrayList", "LinkedList", 
                                   "HashSet", "TreeSet", "Map", "HashMap", "TreeMap"];
            
            if (!containerTypes.includes(containerType)) {
                return { 
                    isValid: false, 
                    error: `Неизвестный контейнерный тип: ${containerType}` 
                };
            }
            
            if (containerType.includes('Map')) {
                const mapTypes = innerTypeStr.split(',').map(s => normalizeString(s));
                if (mapTypes.length !== 2) {
                    return { isValid: false, error: 'Для Map требуется два типа через запятую' };
                }
                
                const [keyType, valueType] = mapTypes;
                const keyResult = parseInnerType(keyType, true);
                const valueResult = parseInnerType(valueType, true);
                
                if (!keyResult.isValid) {
                    return { isValid: false, error: `Некорректный тип ключа: ${keyResult.error}` };
                }
                if (!valueResult.isValid) {
                    return { isValid: false, error: `Некорректный тип значения: ${valueResult.error}` };
                }
                
                return { 
                    isValid: true, 
                    type: 'generic-map', 
                    value: normalizedType,
                    container: containerType,
                    keyType: keyType,
                    valueType: valueType
                };
            } else {
                const innerType = normalizeString(innerTypeStr);
                const innerResult = parseInnerType(innerType, true);
                
                if (!innerResult.isValid) {
                    return { isValid: false, error: `Некорректный внутренний тип: ${innerResult.error}` };
                }
                
                return { 
                    isValid: true, 
                    type: 'generic', 
                    value: normalizedType,
                    container: containerType,
                    innerType: innerType
                };
            }
        }
        
        const suggestion = entityNames.length > 0 
            ? `Возможно вы имели в виду: ${entityNames.join(', ')}`
            : 'Создайте сначала сущности';
        
        return { 
            isValid: false, 
            error: `Некорректный тип "${normalizedType}". ${suggestion}` 
        };
    };

    const parseInnerType = (typeString, hasRelation = false) => {
        const normalized = normalizeString(typeString);
        
        const basicTypes = ["String", "Integer", "Long", "Double", "Float", "Boolean", 
                           "LocalDate", "LocalDateTime", "LocalTime", "BigDecimal"];
        
        if (basicTypes.includes(normalized)) {
            return { isValid: true, type: 'basic', value: normalized };
        }
        
        if (hasRelation && entityNames.includes(normalized)) {
            return { isValid: true, type: 'entity', value: normalized };
        }
        
        const genericMatch = normalized.match(/^(\w+)<(.+)>$/);
        if (genericMatch && hasRelation) {
            return parseComplexType(normalized, true);
        }
        
        return { 
            isValid: false, 
            error: hasRelation 
                ? `Неизвестный тип: ${normalized}` 
                : `Некорректный тип "${normalized}". Для простых полей допустимы только базовые типы` 
        };
    };

    const validateConfig = (config) => {
        const validationErrors = [];
        
        if (!config.entities || config.entities.length === 0) {
            validationErrors.push('Должна быть хотя бы одна сущность');
            return validationErrors;
        }
        
        config.entities.forEach((entity, entityIndex) => {
            if (!entity.name?.trim()) {
                validationErrors.push(`Сущность ${entityIndex + 1}: имя обязательно`);
            }
            
            if (entity.fields && entity.fields.length > 0) {
                entity.fields.forEach((field, fieldIndex) => {
                    if (!field.name?.trim()) {
                        validationErrors.push(`Сущность "${entity.name || entityIndex + 1}", поле ${fieldIndex + 1}: имя обязательно`);
                    }
                    
                    if (!field.type) {
                        validationErrors.push(`Сущность "${entity.name || entityIndex + 1}", поле "${field.name || fieldIndex + 1}": тип обязателен`);
                    } else {
                        const hasRelation = !!field.relation;
                        const typeValidation = parseComplexType(field.type, hasRelation);
                        if (!typeValidation.isValid) {
                            validationErrors.push(`Сущность "${entity.name || entityIndex + 1}", поле "${field.name || fieldIndex + 1}": ${typeValidation.error}`);
                        }
                        
                        if (field.relation) {
                            if (!field.relation.targetEntity?.trim()) {
                                validationErrors.push(`Сущность "${entity.name || entityIndex + 1}", поле "${field.name}": targetEntity обязателен для связанного поля`);
                            }
                            
                            if (typeValidation.type === 'entity' || typeValidation.type === 'generic') {
                                const targetEntity = normalizeString(field.relation.targetEntity);
                                const expectedEntityName = typeValidation.type === 'entity' 
                                    ? typeValidation.value 
                                    : typeValidation.innerType;
                                
                                if (targetEntity.toLowerCase() !== expectedEntityName.toLowerCase()) {
                                    validationErrors.push(`Сущность "${entity.name || entityIndex + 1}", поле "${field.name}": targetEntity "${targetEntity}" не соответствует типу поля "${expectedEntityName}"`);
                                }
                            }
                        }
                    }
                });
            }
        });
        
        return validationErrors;
    };

    const handleDataChange = (newData) => {
        setData(newData);
        
        if (onChange) {
            onChange(newData);
        }
    };

    const addEntity = () => {
        const newEntities = [...data.entities];
        const entityNum = newEntities.length + 1;
        
        newEntities.push({
            name: `Entity${entityNum}`,
            description: "",
            fields: []
        });
        
        handleDataChange({ ...data, entities: newEntities });
    };

    const addField = (entityIndex, withRelation = false) => {
        const newEntities = [...data.entities];
        const entity = newEntities[entityIndex];
        const fieldNum = (entity.fields || []).length + 1;
        
        const newField = {
            name: `field${fieldNum}`,
            type: "String",
            description: "",
            required: false
        };
        
        if (withRelation) {
            newField.type = entityNames.length > 0 ? entityNames[0] : "Entity";
            newField.relation = {
                type: "MANY_TO_ONE",
                targetEntity: entityNames.length > 0 ? entityNames[0].toLowerCase() : "entity",
                fetchType: "LAZY",
                cascadeType: "PERSIST"
            };
        }
        
        entity.fields = [...(entity.fields || []), newField];
        
        handleDataChange({ ...data, entities: newEntities });
    };

    const restrictTypeSelection = (node) => {
        const path = node.path ? node.path.join('.') : '';
        const cleanPath = path.replace(/\[\d+\]/g, '[*]');
        
        switch(true) {
            case cleanPath.includes('name'):
            case cleanPath.includes('description'):
            case cleanPath.includes('targetEntity'):
                return ['string'];
            
            case cleanPath.includes('required'):
                return ['boolean'];
            
            case cleanPath.endsWith('type') && !cleanPath.includes('relation.type'):
                const matches = path.match(/entities\[(\d+)\]\.fields\[(\d+)\]/);
                if (matches) {
                    const entityIndex = parseInt(matches[1]);
                    const fieldIndex = parseInt(matches[2]);
                    const field = data.entities[entityIndex]?.fields[fieldIndex];
                    
                    if (field?.relation) {
                        return ['string'];
                    } else {
                        return [fieldTypesEnum];
                    }
                }
                return [fieldTypesEnum];
                
            case cleanPath.endsWith('relation.type'):
                return [relationTypesEnum];
            case cleanPath.endsWith('fetchType'):
                return [fetchTypesEnum];
            case cleanPath.endsWith('cascadeType'):
                return [cascadeTypesEnum];
            
            case cleanPath === 'entities':
                return ['array'];
            case cleanPath.endsWith('entities[*]'):
            case cleanPath.endsWith('fields[*]'):
            case cleanPath.endsWith('relation'):
                return ['object'];
            
            default:
                return false;
        }
    };

    const restrictEdit = (node) => {
        const path = node.path ? node.path.join('.') : '';
        
        // Проверяем поле type внутри fields
        if (path.includes('fields') && path.includes('type') && !path.includes('relation.type')) {
            const matches = path.match(/entities\[(\d+)\]\.fields\[(\d+)\]\.type/);
            if (matches) {
                const entityIndex = parseInt(matches[1]);
                const fieldIndex = parseInt(matches[2]);
                const field = data.entities[entityIndex]?.fields[fieldIndex];
                

                return !!field?.relation;
            }
        }
        
        return false;
    };

    return (
        <div className="entity-editor-container">
            <div className="entity-controls-fixed">
                <button className="add-entity-btn" onClick={addEntity}>
                    + Сущность
                </button>
                
                {data.entities.map((entity, entityIndex) => (
                    <div key={entityIndex} className="entity-header-compact">
                        <h4>{entity.name || `Сущность ${entityIndex + 1}`}</h4>
                        <div className="entity-controls-compact">
                            <button 
                                className="add-field-btn"
                                onClick={() => addField(entityIndex, false)}
                            >
                                + Поле
                            </button>
                            <button 
                                className="add-field-btn"
                                onClick={() => addField(entityIndex, true)}
                            >
                                + Связь
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Теперь используем общий класс json-editor-wrapper */}
            <JsonEditor
                data={data}
                setData={handleDataChange}
                restrictTypeSelection={restrictTypeSelection}
                restrictEdit={restrictEdit}
                showTypesSelector={true}
                restrictAdd={(node) => {
                    const path = node.path ? node.path.join('.') : '';
                    return !path.includes('entities') && !path.includes('fields');
                }}
                restrictDelete={(node) => {
                    const path = node.path ? node.path.join('.') : '';
                    return path === '' || path === 'entities';
                }}
                restrictDrag={() => true}
                theme={customJsonEditorTheme} 
                icons={{
                    add: <span style={{ display: 'none' }} />,
                    delete: <span style={{ display: 'none' }} />
                }}
                style={{
                    minWidth: '100%',
                    width: '100%'
                }}
            />
        </div>
    );
};

export default EntityConfigEditor;