import React, { useState, useEffect, useRef } from 'react';
import { projectService } from '../services/projectService';
import LogViewer from '../components/LogViewer';
import { authService } from '../services/authService';
import { saveService } from '../services/saveService';

const GenerationPage = () => {
    const [entityFile, setEntityFile] = useState(null);
    const [appFile, setAppFile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [projectSaves, setProjectSaves] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [useProjectConfigs, setUseProjectConfigs] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        loadProjects();
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadProjectSaves();
        }
    }, [selectedProject]);

    const loadProjects = async () => {
        setLoadingProjects(true);
        try {
            const projects = await projectService.getUserProjects();
            setOwnedProjects(projects);
        } catch (error) {
            addLog("ERROR", "Ошибка загрузки проектов");
        } finally {
            setLoadingProjects(false);
        }
    };

    const loadProjectSaves = async () => {
        if (!selectedProject) return;
        
        try {
            const saves = await saveService.getProjectSaves(selectedProject.name);
            setProjectSaves(saves);
        } catch (error) {
            addLog("ERROR", "Ошибка загрузки сохранений проекта");
        }
    };

    const handleProjectConfigSelect = async (saveName) => {
        if (!selectedProject) return;
        
        try {
            const [entityConfigData, appConfigData] = await Promise.all([
                saveService.downloadProjectEntity(saveName),
                saveService.downloadProjectApp(saveName)
            ]);
            
            const entityBlob = new Blob([JSON.stringify(entityConfigData, null, 2)], { type: 'application/json' });
            const appBlob = new Blob([JSON.stringify(appConfigData, null, 2)], { type: 'application/json' });
            
            const entityFile = new File([entityBlob], `${saveName}_entity-config.json`, { type: 'application/json' });
            const appFile = new File([appBlob], `${saveName}_app-config.json`, { type: 'application/json' });
            
            setEntityFile(entityFile);
            setAppFile(appFile);
            
            addLog("SUCCESS", `Загружены конфигурации проекта "${saveName}"`);
        } catch (error) {
            addLog("ERROR", `Ошибка загрузки конфигурации: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = authService.getToken();
        if (!token || !token.trim()) {
            addLog("ERROR", "Пользователь не авторизован");
            return;
        }

        if (!entityFile || !appFile) {
            addLog("ERROR", "Необходимо загрузить оба файла конфигурации");
            return;
        }

        const formData = new FormData();
        formData.append('entityConfig', entityFile);
        formData.append('appConfig', appFile);

        try {
            setIsGenerating(true);
            addLog("INFO", "Начинаю генерацию проекта...");
            
            const response = await projectService.generateProject(formData);
            const generationId = response.id || response;
            
            addLog("INFO", `ID генерации: ${generationId}`);
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            
            eventSourceRef.current = projectService.startGenerationStream(
                generationId,
                (level, message) => addLog(level, message),
                () => handleZipReady(generationId)
            );
            
        } catch (error) {
            addLog("ERROR", error.message || "Ошибка при генерации проекта");
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
            addLog("INFO", `Загружен файл: ${e.target.files[0].name}`);
        }
    };

    return (
        <div className="generation-page">
            <h2>Генерация проекта</h2>

            <div className="generation-controls">
                <div className="generation-mode">
                    <button
                        onClick={() => setUseProjectConfigs(!useProjectConfigs)}
                        className="mode-toggle-button"
                    >
                        {useProjectConfigs ? '[Использовать конфигурации проекта]' : '[Загрузить файлы вручную]'}
                    </button>
                </div>

                {useProjectConfigs ? (
                    <div className="project-select-section">
                        <select 
                            value={selectedProject?.id || ''}
                            onChange={(e) => {
                                const projectId = e.target.value;
                                const project = ownedProjects.find(p => p.id.toString() === projectId);
                                setSelectedProject(project || null);
                                setAppFile(null);
                                setEntityFile(null);
                            }}
                            disabled={loadingProjects || isGenerating}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-main)',
                                fontSize: '1rem',
                                padding: 'var(--spacing-sm) 0',
                                marginBottom: 'var(--spacing-md)',
                                outline: 'none',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <option value="">-- Выберите проект --</option>
                            {ownedProjects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        
                        {selectedProject && projectSaves.length > 0 && (
                            <div className="project-saves-section">
                                <h4>Доступные конфигурации:</h4>
                                <div className="saves-list">
                                    {projectSaves.map((save, index) => (
                                        <div key={index} className="save-item">
                                            <span className="save-name">
                                                {save}
                                            </span>
                                            <button 
                                                onClick={() => handleProjectConfigSelect(save)}
                                                disabled={isGenerating}
                                                className="action-button"
                                            >
                                                [Загрузить]
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedProject && projectSaves.length === 0 && (
                            <div className="no-saves-message">
                                Нет сохраненных конфигураций для этого проекта
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="file-inputs">
                            <div className="file-input">
                                <div className="file-label">
                                    Конфигурация сущностей (entity-config.json):
                                </div>
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleFileChange(setEntityFile)}
                                    required 
                                    disabled={isGenerating}
                                    style={{
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'var(--font-family-main)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--color-border)',
                                        padding: 'var(--spacing-sm) 0',
                                        width: '100%',
                                        cursor: 'pointer'
                                    }}
                                />
                                {entityFile && (
                                    <div className="file-selected">
                                        ✓ {entityFile.name}
                                    </div>
                                )}
                            </div>
                            <div className="file-input">
                                <div className="file-label">
                                    Конфигурация приложения (app-config.json):
                                </div>
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleFileChange(setAppFile)}
                                    required 
                                    disabled={isGenerating}
                                    style={{
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'var(--font-family-main)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--color-border)',
                                        padding: 'var(--spacing-sm) 0',
                                        width: '100%',
                                        cursor: 'pointer'
                                    }}
                                />
                                {appFile && (
                                    <div className="file-selected">
                                        ✓ {appFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                )}

                <div className="generation-status">
                    {entityFile && appFile && (
                        <div className="configs-loaded">
                            ✓ Конфигурации загружены и готовы к генерации
                        </div>
                    )}
                    <button 
                        onClick={handleSubmit} 
                        disabled={isGenerating || (!entityFile || !appFile)}
                        className="generate-button"
                    >
                        {isGenerating ? '[Генерация...]' : '[Сгенерировать проект]'}
                    </button>
                </div>
            </div>

            <LogViewer logs={logs} />
        </div>
    );
};

export default GenerationPage;