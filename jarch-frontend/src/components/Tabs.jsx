import React from 'react';

const tabs = [
    { id: 'projects', label: '[Мои проекты]' },
    { id: 'generation', label: '[Генерация проекта]' }
];

const Tabs = ({ activeTab, onTabChange }) => {
    return (
        <div className="tabs-container">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;