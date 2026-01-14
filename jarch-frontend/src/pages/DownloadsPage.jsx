import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';

const DownloadsPage = () => {
    const [saveName, setSaveName] = useState('');
    const [availableSaves, setAvailableSaves] = useState([]);
    const [downloadHistory, setDownloadHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('downloadHistory');
        if (savedHistory) {
            setDownloadHistory(JSON.parse(savedHistory));
        }
        
        loadAvailableSaves();
    }, []);

    const loadAvailableSaves = async () => {
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
        }
    };

    const downloadAsFile = (content, filename, contentType) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: contentType });
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
        if (!saveName) {
            alert('Выберите сохранение');
            return;
        }

        try {
            const config = await saveService.downloadConfig(saveName);
            downloadAsFile(config, `${saveName}_config.json`, 'application/json');
            addToHistory(`Конфиг приложения: ${saveName}`);
            alert('Конфигурация приложения скачана!');
        } catch (error) {
            console.error('Ошибка скачивания конфига:', error);
            alert('Ошибка скачивания: ' + error.message);
        }
    };

    const handleDownloadEntity = async () => {
        if (!saveName) {
            alert('Выберите сохранение');
            return;
        }

        try {
            const config = await saveService.downloadEntity(saveName);
            downloadAsFile(config, `${saveName}_entity.json`, 'application/json');
            addToHistory(`Конфиг сущностей: ${saveName}`);
            alert('Конфигурация сущностей скачана!');
        } catch (error) {
            console.error('Ошибка скачивания сущностей:', error);
            alert('Ошибка скачивания: ' + error.message);
        }
    };

    const handleDownloadBoth = async () => {
        if (!saveName) {
            alert('Выберите сохранение');
            return;
        }

        try {
            await handleDownloadConfig();
            setTimeout(() => handleDownloadEntity(), 300);
        } catch (error) {
            alert('Ошибка скачивания: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Загрузки конфигураций</h2>

            <div>
                <div>
                    <h3>Загрузить сохраненные конфигурации</h3>
                    
                    <div>
                        <label>Выберите сохранение:</label>
                        <select 
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                        >
                            <option value="">-- Выберите сохранение --</option>
                            {availableSaves.map((save, index) => (
                                <option key={index} value={save}>
                                    {save}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <button onClick={handleDownloadBoth}>
                            [Загрузить оба файла]
                        </button>
                        <div>
                            <button onClick={handleDownloadConfig}>
                                Только app-config.json
                            </button>
                            <button onClick={handleDownloadEntity}>
                                Только entity-config.json
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <button onClick={loadAvailableSaves}>
                            [Обновить список сохранений]
                        </button>
                    </div>
                </div>

                <div>
                    <h3>История загрузок</h3>
                    <div>
                        {downloadHistory.map((entry, index) => (
                            <div key={index}>
                                {entry.timestamp} - {entry.item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadsPage;