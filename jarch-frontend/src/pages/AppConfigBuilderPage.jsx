import React, { useState } from 'react';
import AppConfigEditor from '../components/AppConfigEditor';
import EntityConfigEditor from '../components/EntityConfigEditor';

const AppConfigBuilderPage = ({ 
    onAppConfigChange, 
    onEntityConfigChange,
    onAppConfigValidationChange,
    onEntityConfigValidationChange 
}) => {
    const [activeTab, setActiveTab] = useState('app');

    const handleAppConfigChange = (newConfig) => {
        if (onAppConfigChange) {
            onAppConfigChange(newConfig);
        }
    };

    const handleEntityConfigChange = (newConfig) => {
        if (onEntityConfigChange) {
            onEntityConfigChange(newConfig);
        }
    };

    const handleAppConfigValidation = (isValid) => {
        if (onAppConfigValidationChange) {
            onAppConfigValidationChange(isValid);
        }
    };

    const handleEntityConfigValidation = (isValid) => {
        if (onEntityConfigValidationChange) {
            onEntityConfigValidationChange(isValid);
        }
    };

    return (
        <div className="config-builder-page">
            <div className="config-builder-controls">
                <button 
                    onClick={() => setActiveTab('app')}
                    className={activeTab === 'app' ? 'active' : ''}
                >
                    [app-config.json]
                </button>
                <button 
                    onClick={() => setActiveTab('entity')}
                    className={activeTab === 'entity' ? 'active' : ''}
                >
                    [entity-config.json]
                </button>
            </div>

            <div className="json-editor-container">
                {activeTab === 'app' ? (
                    <div className="json-editor-wrapper">
                        <AppConfigEditor 
                            onChange={handleAppConfigChange}
                            onValidationChange={handleAppConfigValidation}
                        />
                    </div>
                ) : (
                    <div className="json-editor-wrapper">
                        <EntityConfigEditor 
                            onChange={handleEntityConfigChange}
                            onValidationChange={handleEntityConfigValidation}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppConfigBuilderPage;