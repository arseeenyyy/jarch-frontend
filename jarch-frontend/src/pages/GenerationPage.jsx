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
            console.error('Ошибка загрузки проектов:', error);
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
            console.error('Ошибка загрузки сохранений проекта:', error);
        }
    };

    const handleProjectConfigSelect = async (saveName) => {
        if (!selectedProject) return;
        
        try {
            const [appConfigData, entityConfigData] = await Promise.all([
                saveService.downloadConfigByProject(selectedProject.name, saveName),
                saveService.downloadEntityByProject(selectedProject.name, saveName)
            ]);
            
            const appBlob = new Blob([JSON.stringify(appConfigData, null, 2)], { type: 'application/json' });
            const entityBlob = new Blob([JSON.stringify(entityConfigData, null, 2)], { type: 'application/json' });
            
            const appFile = new File([appBlob], `${saveName}_app-config.json`, { type: 'application/json' });
            const entityFile = new File([entityBlob], `${saveName}_entity-config.json`, { type: 'application/json' });
            
            setAppFile(appFile);
            setEntityFile(entityFile);
            
            addLog("SUCCESS", `Загружена конфигурация "${saveName}" из проекта`);
        } catch (error) {
            console.error('Ошибка загрузки конфигурации:', error);
            addLog("ERROR", `Ошибка загрузки конфигурации`);
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
        <div>
            <h2>Генерация проекта</h2>

            <div className="generation-controls">
                <div className="generation-mode">
                    <button
                        onClick={() => setUseProjectConfigs(!useProjectConfigs)}
                        className="mode-toggle-button"
                        style={{ 
                            textAlign: 'left', 
                            paddingLeft: '5px',
                            marginBottom: 'var(--spacing-md)',
                            background: useProjectConfigs ? 'rgba(90, 90, 138, 0.2)' : 'transparent'
                        }}
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
                                <div className="saves-list">
                                    {projectSaves.map((save, index) => (
                                        <div key={index} className="save-item">
                                            <span className="save-name">{save}</span>
                                            <button 
                                                onClick={() => handleProjectConfigSelect(save)}
                                                disabled={isGenerating}
                                                className="action-button"
                                                style={{
                                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                    fontSize: '0.9rem',
                                                    textAlign: 'left',
                                                    paddingLeft: '5px'
                                                }}
                                            >
                                                [Выбрать]
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="file-inputs">
                            <div className="file-input">
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
                                        marginBottom: 'var(--spacing-md)'
                                    }}
                                />
                            </div>
                            <div className="file-input">
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
                                        marginBottom: 'var(--spacing-md)'
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                )}

                <button 
                    onClick={handleSubmit} 
                    disabled={isGenerating || (!entityFile || !appFile)}
                    style={{
                        display: "block",
                        textAlign: "left",
                        paddingLeft: "5px",
                        marginTop: "var(--spacing-md)"
                    }}
                >
                    {isGenerating ? '[Генерация...]' : '[Сгенерировать проект]'}
                </button>
            </div>

            <LogViewer logs={logs} />
        </div>
    );
};

export default GenerationPage;