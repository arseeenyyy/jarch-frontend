import React, { useState, useEffect, useRef } from 'react';
import { projectService } from '../services/projectService';
import LogViewer from '../components/LogViewer';

const GenerationPage = ({ jwtToken, setJwtToken }) => {
    const [entityFile, setEntityFile] = useState(null);
    const [appFile, setAppFile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!jwtToken.trim()) {
            alert("Введите JWT токен!");
            return;
        }

        if (!entityFile || !appFile) {
            alert("Загрузите оба конфигурационных файла!");
            return;
        }

        const formData = new FormData();
        formData.append('entityConfig', entityFile);
        formData.append('appConfig', appFile);

        try {
            setIsGenerating(true);
            addLog("INFO", "Начинаю генерацию проекта...");
            
            const { id } = await projectService.generateProject(formData);
            addLog("INFO", `ID генерации: ${id}`);
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            
            eventSourceRef.current = projectService.startGenerationStream(
                id,
                (level, message) => addLog(level, message),
                () => handleZipReady(id)
            );
            
        } catch (error) {
            addLog("ERROR", error.message);
            setIsGenerating(false);
        }
    };

    const handleZipReady = async (id) => {
        try {
            addLog("SUCCESS", "ZIP файл готов. Начинаю скачивание...");
            
            const response = await projectService.downloadProject(id);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const a = document.createElement("a");
            const url = URL.createObjectURL(blob);
            a.href = url;
            a.download = `generated-project-${id}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            addLog("SUCCESS", "Проект успешно скачан!");
        } catch (error) {
            addLog("ERROR", `Ошибка скачивания: ${error.message}`);
        } finally {
            setIsGenerating(false);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        }
    };

    const addLog = (level, message) => {
        setLogs(prev => [...prev, {
            level,
            message,
            timestamp: new Date()
        }]);
    };

    const handleFileChange = (setter) => (e) => {
        if (e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    return (
        <div id="generation" className="tab-content active">
            <h2>🛠️ Генерация нового проекта</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>JWT токен:</label>
                    <input 
                        type="text" 
                        value={jwtToken}
                        onChange={(e) => setJwtToken(e.target.value)}
                        placeholder="Введите JWT токен" 
                        required 
                        disabled={isGenerating}
                    />
                </div>

                <div className="grid">
                    <div className="form-group">
                        <label>Конфигурация сущностей (JSON):</label>
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange(setEntityFile)}
                            required 
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="form-group">
                        <label>Конфигурация приложения (JSON):</label>
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange(setAppFile)}
                            required 
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                <button type="submit" disabled={isGenerating}>
                    {isGenerating ? '⏳ Генерация...' : '🚀 Сгенерировать проект'}
                </button>
            </form>

            <LogViewer logs={logs} />
        </div>
    );
};

export default GenerationPage;