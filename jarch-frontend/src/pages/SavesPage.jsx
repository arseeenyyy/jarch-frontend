import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';

const SavesPage = () => {
    const [saves, setSaves] = useState([]);
    const [saveName, setSaveName] = useState('');
    const [entityFile, setEntityFile] = useState(null);
    const [appFile, setAppFile] = useState(null);

    useEffect(() => {
        loadSaves();
    }, []);

    const loadSaves = async () => {
        try {
            const savesList = await saveService.getSaves();
            const formattedSaves = savesList.map(filename => {
                const parts = filename.split('_');
                if (parts.length >= 2) {
                    return parts[0];
                }
                return filename;
            });
            
            const uniqueSaves = [...new Set(formattedSaves)];
            setSaves(uniqueSaves);
        } catch (error) {
            console.error('Ошибка загрузки сохранений:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!saveName.trim()) {
            alert('Введите название сохранения');
            return;
        }

        if (!entityFile || !appFile) {
            alert('Загрузите оба файла конфигурации');
            return;
        }

        const formData = new FormData();
        formData.append('saveName', saveName);
        formData.append('entityConfig', entityFile);
        formData.append('appConfig', appFile);

        try {
            await saveService.createSave(formData);
            
            setSaveName('');
            setEntityFile(null);
            setAppFile(null);
            document.querySelectorAll('input[type="file"]').forEach(input => {
                input.value = '';
            });
            
            loadSaves();
            alert('Сохранение успешно создано!');
        } catch (error) {
            console.error('Ошибка создания сохранения:', error);
            alert('Ошибка при создании сохранения: ' + error.message);
        }
    };

    const deleteSave = async (saveName) => {
        const confirmDelete = window.confirm(`Удалить сохранение "${saveName}"?`);
        if (!confirmDelete) return;
        
        setSaves(prev => prev.filter(s => s !== saveName));
    };

    const downloadSave = async (saveName) => {
        try {
            const [entityConfig, appConfig] = await Promise.all([
                saveService.downloadEntity(saveName),
                saveService.downloadConfig(saveName)
            ]);
            
            const entityBlob = new Blob([JSON.stringify(entityConfig, null, 2)], { type: 'application/json' });
            const appBlob = new Blob([JSON.stringify(appConfig, null, 2)], { type: 'application/json' });
            
            const entityUrl = URL.createObjectURL(entityBlob);
            const appUrl = URL.createObjectURL(appBlob);
            
            const entityLink = document.createElement('a');
            entityLink.href = entityUrl;
            entityLink.download = `${saveName}_entity.json`;
            
            const appLink = document.createElement('a');
            appLink.href = appUrl;
            appLink.download = `${saveName}_app.json`;
            
            entityLink.click();
            setTimeout(() => appLink.click(), 100);
            
            setTimeout(() => {
                URL.revokeObjectURL(entityUrl);
                URL.revokeObjectURL(appUrl);
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка скачивания:', error);
            alert('Ошибка при скачивании: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Управление сохранениями конфигураций</h2>

            <div>
                <div>
                    <h3>Создать новое сохранение</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Название сохранения:</label>
                            <input 
                                type="text" 
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="Уникальное название" 
                                required 
                            />
                        </div>
                        <div>
                            <label>Конфигурация сущностей (JSON):</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setEntityFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <div>
                            <label>Конфигурация приложения (JSON):</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setAppFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <button 
                            type="submit"
                            style={{
                                display: "block",
                                textAlign: "left",
                                paddingLeft: "5px"
                            }}
                        >
                            [Сохранить конфигурацию]
                        </button>
                    </form>
                </div>

                <div>
                    <h3>Мои сохраненные конфигурации</h3>
                    
                    <div>
                        <button onClick={loadSaves}>
                            [Обновить список]
                        </button>
                    </div>
                    
                    <div>
                        {saves.length === 0 ? (
                            <p>Нет сохраненных конфигураций</p>
                        ) : (
                            saves.map((save, index) => (
                                <div key={index}>
                                    <span>{save}</span>
                                    <div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadSave(save);
                                            }}
                                        >
                                            Скачать
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSave(save);
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div>
                        <p>Сохранение загружает конфигурации в облачное хранилище.</p>
                        <p>Можно использовать сохраненные конфигурации для быстрой генерации проектов.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavesPage;