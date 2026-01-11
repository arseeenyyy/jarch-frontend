import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

const AppConfigEditor = ({ onChange, onValidationChange }) => {
    const [data, setData] = useState({
        basePackage: "",
        applicationName: "",
        buildTool: "MAVEN",
        propertiesFormat: "YAML",
        serverPort: 8080,
        database: {
            type: "POSTGRESQL",
            host: "localhost",
            port: 5432,
            databaseName: "",
            username: "",
            password: "",
            ddlAuto: "update",
            poolSize: 10
        }
    });

    const buildToolEnum = {
        enum: "Build Tool",
        values: ["MAVEN", "GRADLE"],
        matchPriority: 1
    };

    const propertiesFormatEnum = {
        enum: "Properties Format",
        values: ["YAML", "PROPERTIES"],
        matchPriority: 1
    };

    const databaseTypeEnum = {
        enum: "Database Type",
        values: ["POSTGRESQL", "MYSQL", "H2", "ORACLE", "MONGODB"],
        matchPriority: 1
    };

    const ddlAutoEnum = {
        enum: "DDL Auto",
        values: ["none", "validate", "update", "create", "create-drop"],
        matchPriority: 1
    };

    const validateConfig = (config) => {
        const errors = [];
        
        if (!config.basePackage?.trim()) {
            errors.push('basePackage обязателен');
        }
        if (!config.applicationName?.trim()) {
            errors.push('applicationName обязателен');
        }
        if (!config.buildTool) {
            errors.push('buildTool обязателен');
        }
        if (!config.propertiesFormat) {
            errors.push('propertiesFormat обязателен');
        }
        
        if (config.serverPort <= 0) {
            errors.push('serverPort должен быть положительным числом');
        }
        if (config.serverPort > 65535) {
            errors.push('serverPort должен быть меньше 65535');
        }
        
        if (!config.database.type) {
            errors.push('database.type обязателен');
        }
        if (!config.database.host?.trim()) {
            errors.push('database.host обязателен');
        }
        if (config.database.port <= 0) {
            errors.push('database.port должен быть положительным числом');
        }
        if (config.database.port > 65535) {
            errors.push('database.port должен быть меньше 65535');
        }
        if (!config.database.databaseName?.trim()) {
            errors.push('database.databaseName обязателен');
        }
        if (!config.database.username?.trim()) {
            errors.push('database.username обязателен');
        }
        if (config.database.poolSize < 1) {
            errors.push('database.poolSize должен быть минимум 1');
        }
        
        return errors;
    };

    const handleDataChange = (newData) => {
        setData(newData);
        
        const errors = validateConfig(newData);
        const isValid = errors.length === 0;
        
        if (onChange) {
            onChange(newData);
        }
        if (onValidationChange) {
            onValidationChange(isValid, errors);
        }
    };

    const restrictTypeSelection = (node) => {
        const fieldName = node.key;
        const path = node.path ? node.path.join('.') : '';
        
        if (path === 'database.type') {
            return [databaseTypeEnum];
        } else if (path === 'database.ddlAuto') {
            return [ddlAutoEnum];
        }
        
        switch(fieldName) {
            case 'basePackage':
            case 'applicationName':
            case 'host':
            case 'databaseName':
            case 'username':
            case 'password':
                return ['string'];
            case 'serverPort':
            case 'port':
            case 'poolSize':
                return ['number'];
            case 'buildTool':
                return [buildToolEnum];
            case 'propertiesFormat':
                return [propertiesFormatEnum];
            default:
                return false;
        }
    };

    return (
        <div>
            <JsonEditor
                data={data}
                setData={handleDataChange}
                restrictTypeSelection={restrictTypeSelection}
                showTypesSelector={true}
                restrictAdd={() => true}
                restrictDelete={() => true}
                restrictEdit={() => false}
                restrictDrag={() => true}
                icons={{
                    add: <span style={{ display: 'none' }} />,
                    delete: <span style={{ display: 'none' }} />
                }}
            />
        </div>
    );
};

export default AppConfigEditor;