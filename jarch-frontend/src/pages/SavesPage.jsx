import React, { useState, useEffect } from 'react';
import { saveService } from '../services/saveService';
import SaveItem from '../components/SaveItem';

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
            setSaves(savesList);
        } catch (error) {
            console.error('Ошибка загрузки сохранений:', error);
            alert('Ошибка загрузки сохранений: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!saveName.trim()) {
            alert('Введите название сохранения!');
            return;
        }

        if (!entityFile || !appFile) {
            alert('Загрузите оба конфигурационных файла!');
            return;
        }

        const formData = new FormData();
        formData.append('saveName', saveName);
        formData.append('entityConfig', entityFile);
        formData.append('appConfig', appFile);

        try {
            await saveService.createSave(formData);
            alert('Сохранение успешно создано!');
            setSaveName('');
            setEntityFile(null);
            setAppFile(null);
            document.querySelectorAll('#createSaveForm input[type="file"]').forEach(input => {
                input.value = '';
            });
            loadSaves();
        } catch (error) {
            alert('Ошибка создания сохранения: ' + error.message);
        }
    };

    const deleteSave = async (saveName) => {
        if (window.confirm(`Удалить сохранение "${saveName}"?`)) {
            try {
                await saveService.deleteSave(saveName);
                loadSaves();
            } catch (error) {
                alert('Ошибка удаления: ' + error.message);
            }
        }
    };

    const selectSave = (saveName) => {
        console.log('Selected save:', saveName);
    };

    return (
        <div id="saves" className="tab-content active">
            <h2>💾 Управление сохранениями</h2>

            <div className="grid">
                <div className="card">
                    <h3>💾 Создать сохранение</h3>
                    <form id="createSaveForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Название сохранения:</label>
                            <input 
                                type="text" 
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="Уникальное название" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Конфигурация сущностей:</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setEntityFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Конфигурация приложения:</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setAppFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <button type="submit">💾 Сохранить конфигурацию</button>
                    </form>
                </div>

                <div className="card">
                    <h3>📂 Мои сохранения</h3>
                    <div id="savesList">
                        {saves.map(save => (
                            <SaveItem 
                                key={save}
                                save={save}
                                onSelect={selectSave}
                                onDelete={deleteSave}
                            />
                        ))}
                        {saves.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                                Нет сохранений
                            </p>
                        )}
                    </div>
                    <button onClick={loadSaves} className="secondary" style={{ marginTop: '10px' }}>
                        🔄 Обновить список
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavesPage;