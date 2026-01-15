import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';

const DownloadsPage = () => {
    const [saveName, setSaveName] = useState('');
    const [availableSaves, setAvailableSaves] = useState([]);
    const [downloadHistory, setDownloadHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedHistory = localStorage.getItem('downloadHistory');
        if (savedHistory) {
            setDownloadHistory(JSON.parse(savedHistory));
        }
        
        loadAvailableSaves();
    }, []);

    const loadAvailableSaves = async () => {
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
            setAvailableSaves(uniqueSaves);
        } catch (error) {
            console.error('Ошибка загрузки списка сохранений:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadAsFile = (content, filename) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const addToHistory = (item) => {
        const newHistory = [{ 
            timestamp: new Date().toLocaleString(), 
            item 
        }, ...downloadHistory.slice(0, 9)];
        
        setDownloadHistory(newHistory);
        localStorage.setItem('downloadHistory', JSON.stringify(newHistory));
    };

    const handleDownloadConfig = async () => {
        if (!saveName) return;

        try {
            const config = await saveService.downloadConfig(saveName);
            downloadAsFile(config, `${saveName}_config.json`);
            addToHistory(`Конфиг приложения: ${saveName}`);
        } catch (error) {
            console.error('Ошибка скачивания конфига:', error);
        }
    };

    const handleDownloadEntity = async () => {
        if (!saveName) return;

        try {
            const config = await saveService.downloadEntity(saveName);
            downloadAsFile(config, `${saveName}_entity.json`);
            addToHistory(`Конфиг сущностей: ${saveName}`);
        } catch (error) {
            console.error('Ошибка скачивания сущностей:', error);
        }
    };

    const handleDownloadBoth = async () => {
        if (!saveName) return;

        try {
            await handleDownloadConfig();
            setTimeout(() => handleDownloadEntity(), 300);
        } catch (error) {
            console.error('Ошибка скачивания:', error);
        }
    };

    return (
        <div className="downloads-page">
            <h2>Загрузки конфигураций</h2>

            <div className="downloads-content">
                <div className="downloads-section">
                    <h3>Загрузить сохраненные конфигурации</h3>
                    
                    <div className="form-group">
                        <label>Выберите сохранение:</label>
                        <select 
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            className="saves-select"
                        >
                            <option value="">-- Выберите сохранение --</option>
                            {availableSaves.map((save, index) => (
                                <option key={index} value={save}>
                                    {save}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="download-buttons">
                        <button onClick={handleDownloadBoth} className="download-button">
                            [Загрузить оба файла]
                        </button>
                        <div className="download-options">
                            <button onClick={handleDownloadConfig} className="option-button">
                                Только app-config.json
                            </button>
                            <button onClick={handleDownloadEntity} className="option-button">
                                Только entity-config.json
                            </button>
                        </div>
                    </div>
                    
                    <div className="refresh-section">
                        <button onClick={loadAvailableSaves} disabled={loading} className="refresh-button">
                            [Обновить список сохранений]
                        </button>
                    </div>
                </div>

                <div className="history-section">
                    <h3>История загрузок</h3>
                    <div className="history-list">
                        {downloadHistory.length === 0 ? (
                            <p className="no-history">История загрузок пуста</p>
                        ) : (
                            downloadHistory.map((entry, index) => (
                                <div key={index} className="history-item">
                                    <span className="history-timestamp">{entry.timestamp}</span>
                                    <span className="history-item-name">{entry.item}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadsPage;