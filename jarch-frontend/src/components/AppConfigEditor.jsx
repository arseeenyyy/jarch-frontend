import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

const AppConfigEditor = () => {
    const [data, setData] = useState({
        basePackage: "",
        applicationName: "",
        buildTool: "MAVEN",
        propertiesFormat: "YAML",
        serverPort: 0,
        database: {
            type: "POSTGRESQL",
            host: "",
            port: 0,
            databaseName: "",
            username: "",
            password: "",
            ddlAuto: "update",
            poolSize: 0
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

    const restrictTypeSelection = (node) => {
        // Проверяем полный путь к полю
        const fieldName = node.key;
        const path = node.path ? node.path.join('.') : '';
        
        // Проверяем сначала конкретные пути, затем общие имена полей
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
            <h1>App Configuration Editor</h1>
            
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

export default AppConfigEditor;