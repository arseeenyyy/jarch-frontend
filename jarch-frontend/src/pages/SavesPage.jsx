import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';

const SavesPage = () => {
    const [saves, setSaves] = useState([]);
    const [saveName, setSaveName] = useState('');
    const [entityFile, setEntityFile] = useState(null);
    const [appFile, setAppFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSaves();
    }, []);

    const loadSaves = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!saveName.trim()) return;
        if (!entityFile || !appFile) return;

        setLoading(true);
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
            
            await loadSaves();
        } catch (error) {
            console.error('Ошибка создания сохранения:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (saveName) => {
        if (!window.confirm(`Удалить сохранение "${saveName}"?`)) return;
        
        setSaves(prev => prev.filter(s => s !== saveName));
    };

    const handleDownload = async (saveName) => {
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
        }
    };

    return (
        <div className="saves-page">
            <h2>Управление сохранениями конфигураций</h2>

            <div className="saves-content">
                <div className="create-save-section">
                    <h3>Создать новое сохранение</h3>
                    <form onSubmit={handleSubmit} className="save-form">
                        <div className="form-group">
                            <label>Название сохранения:</label>
                            <input 
                                type="text" 
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="Уникальное название" 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Конфигурация сущностей (JSON):</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setEntityFile(e.target.files[0])}
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Конфигурация приложения (JSON):</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setAppFile(e.target.files[0])}
                                required 
                                disabled={loading}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? '[Сохранение...]' : '[Сохранить конфигурацию]'}
                        </button>
                    </form>
                </div>

                <div className="saves-list-section">
                    <h3>Мои сохраненные конфигурации</h3>
                    
                    <div className="refresh-section">
                        <button onClick={loadSaves} disabled={loading} className="refresh-button">
                            [Обновить список]
                        </button>
                    </div>
                    
                    <div className="saves-list">
                        {saves.length === 0 ? (
                            <p className="no-saves">Нет сохраненных конфигураций</p>
                        ) : (
                            saves.map((save, index) => (
                                <div key={index} className="save-item">
                                    <span className="save-name">{save}</span>
                                    <div className="save-actions">
                                        <button 
                                            onClick={() => handleDownload(save)}
                                            disabled={loading}
                                            className="action-button download"
                                        >
                                            Скачать
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(save)}
                                            disabled={loading}
                                            className="action-button delete"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavesPage;