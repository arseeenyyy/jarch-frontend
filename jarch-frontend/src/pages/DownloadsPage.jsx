import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';

const DownloadsPage = () => {
    const [saveName, setSaveName] = useState('');
    const [downloadHistory, setDownloadHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('downloadHistory');
        if (savedHistory) {
            setDownloadHistory(JSON.parse(savedHistory));
        }
    }, []);

    const downloadAsFile = (content, filename, contentType) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
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
            alert('Введите название сохранения');
            return;
        }

        try {
            const config = await saveService.downloadConfig(saveName);
            downloadAsFile(config, `${saveName}_config.json`, 'application/json');
            addToHistory(`Конфиг приложения: ${saveName}`);
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    };

    const handleDownloadEntity = async () => {
        if (!saveName) {
            alert('Введите название сохранения');
            return;
        }

        try {
            const config = await saveService.downloadEntity(saveName);
            downloadAsFile(config, `${saveName}_entity.json`, 'application/json');
            addToHistory(`Конфиг сущностей: ${saveName}`);
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    };

    return (
        <div id="downloads" className="tab-content active">
            <h2>📥 Загрузки</h2>

            <div className="grid">
                <div className="card">
                    <h3>⚙️ Загрузить конфигурации</h3>
                    <div className="form-group">
                        <label>Название сохранения:</label>
                        <input 
                            type="text" 
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Введите название сохранения"
                        />
                    </div>
                    <button onClick={handleDownloadConfig}>
                        📥 Загрузить конфиг приложения
                    </button>
                    <button onClick={handleDownloadEntity} className="secondary" style={{ marginTop: '10px' }}>
                        📥 Загрузить конфиг сущностей
                    </button>
                </div>

                <div className="card">
                    <h3>📊 История загрузок</h3>
                    <div id="downloadHistory">
                        {downloadHistory.map((entry, index) => (
                            <div key={index} className="save-item">
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