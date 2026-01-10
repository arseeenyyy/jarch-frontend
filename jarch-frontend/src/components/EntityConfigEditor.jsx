import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

const EntityConfigEditor = () => {
    const [data, setData] = useState({
        entities: []
    });

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

    // Простые функции для добавления
    const addEntity = () => {
        const newData = {
            ...data,
            entities: [
                ...data.entities,
                {
                    name: `Entity${data.entities.length + 1}`,
                    description: "",
                    fields: []
                }
            ]
        };
        setData(newData);
    };

    const addFieldToEntity = (entityIndex) => {
        const newEntities = [...data.entities];
        if (!newEntities[entityIndex].fields) {
            newEntities[entityIndex].fields = [];
        }
        
        newEntities[entityIndex].fields.push({
            name: `field${newEntities[entityIndex].fields.length + 1}`,
            type: "String",
            description: "",
            required: false
        });
        
        setData({ ...data, entities: newEntities });
    };

    const addRelatedFieldToEntity = (entityIndex) => {
        const newEntities = [...data.entities];
        if (!newEntities[entityIndex].fields) {
            newEntities[entityIndex].fields = [];
        }
        
        newEntities[entityIndex].fields.push({
            name: `relatedField${newEntities[entityIndex].fields.length + 1}`,
            type: "String",
            description: "",
            required: false,
            relation: {
                type: "MANY_TO_ONE",
                targetEntity: "",
                fetchType: "LAZY",
                cascadeType: "PERSIST"
            }
        });
        
        setData({ ...data, entities: newEntities });
    };

    return (
        <div>
            <h1>Entity Configuration Editor</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button onClick={addEntity} style={{ marginRight: '10px' }}>
                    Add Entity
                </button>
                
                {data.entities.map((entity, index) => (
                    <div key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                        <span>Entity {index + 1}: {entity.name}</span>
                        <button 
                            onClick={() => addFieldToEntity(index)} 
                            style={{ marginLeft: '10px' }}
                        >
                            Add Field
                        </button>
                        <button 
                            onClick={() => addRelatedFieldToEntity(index)} 
                            style={{ marginLeft: '10px' }}
                        >
                            Add Related Field
                        </button>
                    </div>
                ))}
            </div>
            
            <div>
                <JsonEditor
                    data={data}
                    setData={setData}
                    restrictTypeSelection={restrictTypeSelection}
                    showTypesSelector={true}
                    icons={{
                        edit: <span>✏️</span>,
                        ok: <span>✓</span>,
                        cancel: <span>✗</span>,
                        chevron: <span>▼</span>
                    }}
                />
            </div>
        </div>
    );
};

export default EntityConfigEditor;