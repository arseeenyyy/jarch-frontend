import React from 'react';

const tabs = [
    { id: 'generation', label: 'Генерация проекта' },
    { id: 'projects', label: 'Мои проекты' },
    { id: 'team', label: 'Управление командой' },
    { id: 'saves', label: 'Сохранения' },
    { id: 'downloads', label: 'Загрузки' },
    { id: 'app-config', label: 'Конструктор' }
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