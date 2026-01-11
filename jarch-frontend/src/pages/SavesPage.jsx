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
            setSaves(savesList);
        } catch (error) {
            console.error('Ошибка загрузки сохранений:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!saveName.trim()) {
            return;
        }

        if (!entityFile || !appFile) {
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
        } catch (error) {
            console.error('Ошибка создания сохранения:', error);
        }
    };

    const deleteSave = async (saveName) => {
        try {
            await saveService.deleteSave(saveName);
            loadSaves();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const selectSave = (saveName) => {
        console.log('Выбрано сохранение:', saveName);
    };

    return (
        <div>
            <h2>Управление сохранениями</h2>

            <div>
                <div>
                    <h3>Создать сохранение</h3>
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
                            <label>Конфигурация сущностей:</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setEntityFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <div>
                            <label>Конфигурация приложения:</label>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setAppFile(e.target.files[0])}
                                required 
                            />
                        </div>
                        <button style={{
                                    display: "block",
                                    textAlign: "left",
                                    paddingLeft: "5px"
                                }} type="submit">
                            [Сохранить конфигурацию]
                        </button>
                    </form>
                </div>

                <div>
                    <h3>Мои сохранения</h3>
                    <div>
                        {saves.map(save => (
                            <div key={save} onClick={() => selectSave(save)}>
                                <span>{save}</span>
                                <button onClick={(e) => { 
                                    e.stopPropagation(); 
                                    deleteSave(save); 
                                }}>
                                    Удалить
                                </button>
                            </div>
                        ))}
                        {saves.length === 0 && (
                            <p>Нет сохранений</p>
                        )}
                    </div>
                    <button onClick={loadSaves}>
                        Обновить список
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavesPage;