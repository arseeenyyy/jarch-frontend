import React, { useState, useEffect } from 'react';
import AppConfigBuilderPage from './AppConfigBuilderPage';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { saveService } from '../services/saveService';

const ProjectsPage = () => {
    // Основное состояние
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [projectsWithConfigs, setProjectsWithConfigs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Создание проекта
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Управление выбранным проектом
    const [selectedProject, setSelectedProject] = useState(null);
    
    // Внутренние вкладки
    const [activeSection, setActiveSection] = useState('projects');
    
    // Состояние для вкладки "Команда"
    const [members, setMembers] = useState([]);
    const [memberUsername, setMemberUsername] = useState('');
    
    // Состояние для вкладки "Конструктор"
    const [appConfig, setAppConfig] = useState(null);
    const [entityConfig, setEntityConfig] = useState(null);
    const [appConfigValid, setAppConfigValid] = useState(false);
    const [entityConfigValid, setEntityConfigValid] = useState(false);
    const [projectSaves, setProjectSaves] = useState([]);
    
    // Проверка валидности конфигураций
    const areConfigsValid = appConfigValid && entityConfigValid;
    
    // Загрузка данных
    useEffect(() => {
        loadAllProjects();
    }, []);
    
    useEffect(() => {
        if (selectedProject && activeSection === 'team') {
            loadTeamMembers();
        }
        if (selectedProject && activeSection === 'config-builder') {
            loadProjectSaves();
        }
    }, [selectedProject, activeSection]);
    
    const loadAllProjects = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const [owned, joined] = await Promise.all([
                projectService.getUserProjects(),
                projectService.getJoinedProjects()
            ]);
            
            setOwnedProjects(owned);
            setJoinedProjects(joined);
            
            // Проверяем наличие конфигураций для всех проектов
            const allProjects = [...owned, ...joined];
            const configsPromises = allProjects.map(async (project) => {
                try {
                    const hasConfigs = await saveService.hasProjectSaves(project.name);
                    return { projectId: project.id, hasConfigs };
                } catch (error) {
                    return { projectId: project.id, hasConfigs: false };
                }
            });
            
            const configsResults = await Promise.all(configsPromises);
            const configsMap = {};
            configsResults.forEach(result => {
                configsMap[result.projectId] = result.hasConfigs;
            });
            
            setProjectsWithConfigs(configsMap);
        } catch (error) {
            setError('Ошибка загрузки проектов');
        } finally {
            setLoading(false);
        }
    };
    
    const loadTeamMembers = async () => {
        if (!selectedProject) return;
        
        try {
            const teamMembers = await teamService.getTeamMembers(selectedProject.id);
            setMembers(teamMembers);
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
        }
    };
    
    const loadProjectSaves = async () => {
        if (!selectedProject) return;
        
        try {
            const saves = await saveService.getProjectSaves(selectedProject.name);
            setProjectSaves(saves);
            
            setProjectsWithConfigs(prev => ({
                ...prev,
                [selectedProject.id]: saves.length > 0
            }));
        } catch (error) {
            console.error('Ошибка загрузки сохранений проекта:', error);
        }
    };
    
    const handleCreateProject = async (e) => {
        e.preventDefault();
        
        if (!projectName.trim()) {
            setError('Введите название проекта');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            await projectService.createProject({
                name: projectName,
                description: projectDescription || '',
            });
            
            setProjectName('');
            setProjectDescription('');
            setShowCreateForm(false);
            await loadAllProjects();
            
            setSuccess('Проект успешно создан');
        } catch (error) {
            setError('Ошибка создания проекта');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddMember = async (e) => {
        e.preventDefault();
        
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }
        
        if (!memberUsername.trim()) {
            setError('Введите имя пользователя');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await teamService.addMember(selectedProject.id, {
                username: memberUsername
            });
            
            setMemberUsername('');
            loadTeamMembers();
            setSuccess(`Пользователь ${memberUsername} добавлен в проект`);
        } catch (error) {
            if (error.message.includes('403') || error.message.includes('Forbidden')) {
                setError(`Пользователь "${memberUsername}" не найден`);
            } else {
                setError('Ошибка добавления участника');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveMember = async (username) => {
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }
        
        if (!window.confirm(`Удалить участника "${username}" из проекта?`)) return;
        
        try {
            await teamService.removeMember(selectedProject.id, username);
            loadTeamMembers();
            setSuccess(`Участник ${username} удален из проекта`);
        } catch (error) {
            setError('Ошибка удаления участника');
        }
    };
    
    const handleSaveToProject = async () => {
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }
        
        if (!areConfigsValid) {
            setError('Конфигурации невалидны');
            return;
        }
        
        const fileName = `${selectedProject.name}_config`;
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const formData = new FormData();
            formData.append('projectName', selectedProject.name);
            formData.append('saveName', fileName);
            
            const appConfigBlob = new Blob([JSON.stringify(appConfig)], { type: 'application/json' });
            const entityConfigBlob = new Blob([JSON.stringify(entityConfig)], { type: 'application/json' });
            
            formData.append('appConfig', appConfigBlob, 'app-config.json');
            formData.append('entityConfig', entityConfigBlob, 'entity-config.json');
            
            await saveService.saveToProject(formData);
            
            setSuccess(`Конфигурация "${fileName}" сохранена в проект`);
            
            setProjectsWithConfigs(prev => ({
                ...prev,
                [selectedProject.id]: true
            }));
            
            loadProjectSaves();
        } catch (error) {
            setError('Ошибка сохранения конфигурации');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownloadConfig = () => {
        if (!areConfigsValid) {
            setError('Конфигурации невалидны');
            return;
        }
        
        let fileName = 'config';
        if (selectedProject) {
            fileName = selectedProject.name;
        }
        
        if (appConfig) {
            const appBlob = new Blob([JSON.stringify(appConfig, null, 2)], { 
                type: 'application/json' 
            });
            const appUrl = URL.createObjectURL(appBlob);
            const appLink = document.createElement('a');
            appLink.href = appUrl;
            appLink.download = `${fileName}_app-config.json`;
            appLink.click();
            URL.revokeObjectURL(appUrl);
        }
        
        if (entityConfig) {
            setTimeout(() => {
                const entityBlob = new Blob([JSON.stringify(entityConfig, null, 2)], { 
                    type: 'application/json' 
                });
                const entityUrl = URL.createObjectURL(entityBlob);
                const entityLink = document.createElement('a');
                entityLink.href = entityUrl;
                entityLink.download = `${fileName}_entity-config.json`;
                entityLink.click();
                URL.revokeObjectURL(entityUrl);
            }, 100);
        }
        
        setSuccess('Конфигурации скачаны на диск');
    };
    
    const handleDownloadFromProject = async (saveName) => {
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }
        
        try {
            const [appConfigData, entityConfigData] = await Promise.all([
                saveService.downloadConfigByProject(selectedProject.name, saveName),
                saveService.downloadEntityByProject(selectedProject.name, saveName)
            ]);
            
            const appBlob = new Blob([JSON.stringify(appConfigData, null, 2)], { type: 'application/json' });
            const entityBlob = new Blob([JSON.stringify(entityConfigData, null, 2)], { type: 'application/json' });
            
            const appUrl = URL.createObjectURL(appBlob);
            const entityUrl = URL.createObjectURL(entityBlob);
            
            const appLink = document.createElement('a');
            appLink.href = appUrl;
            appLink.download = `${saveName}_app-config.json`;
            
            const entityLink = document.createElement('a');
            entityLink.href = entityUrl;
            entityLink.download = `${saveName}_entity-config.json`;
            
            appLink.click();
            setTimeout(() => entityLink.click(), 100);
            
            setTimeout(() => {
                URL.revokeObjectURL(appUrl);
                URL.revokeObjectURL(entityUrl);
            }, 1000);
            
            setSuccess(`Конфигурация "${saveName}" скачана`);
        } catch (error) {
            setError('Ошибка скачивания конфигурации');
        }
    };
    
    const renderProjectsSection = () => (
        <div className="projects-content">
            <div className="create-project-section">
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="toggle-form-button"
                    style={{ textAlign: 'left', paddingLeft: '5px' }}
                >
                    {showCreateForm ? '[Скрыть]' : '[Создать проект]'}
                </button>
                
                {showCreateForm && (
                    <form onSubmit={handleCreateProject} className="project-form">
                        <div className="form-group">
                            <label>Название проекта:</label>
                            <input 
                                type="text" 
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Введите название проекта" 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание:</label>
                            <textarea 
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Описание проекта" 
                                rows="3"
                                disabled={loading}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                            style={{ textAlign: 'left', paddingLeft: '5px' }}
                        >
                            {loading ? '[Создание...]' : '[Создать]'}
                        </button>
                    </form>
                )}
            </div>
            
            <div className="projects-list-section">
                <h3>Мои проекты</h3>
                
                <div className="projects-grid">
                    {ownedProjects.length === 0 && joinedProjects.length === 0 ? (
                        <p className="no-projects">
                            У вас еще нет проектов
                        </p>
                    ) : (
                        <>
                            {ownedProjects.map(project => {
                                const hasConfig = projectsWithConfigs[project.id] || false;
                                return (
                                    <div 
                                        key={project.id} 
                                        className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedProject(project);
                                            if (activeSection === 'team') {
                                                loadTeamMembers();
                                            }
                                            if (activeSection === 'config-builder') {
                                                loadProjectSaves();
                                            }
                                        }}
                                    >
                                        <h4 className="project-title">
                                            {project.name}
                                        </h4>
                                        <p className="project-description">
                                            {project.description || 'Без описания'}
                                        </p>
                                        <div className="project-footer">
                                            <span className="project-badge owner">
                                                Владелец
                                            </span>
                                            <span className="project-config-status">
                                                {hasConfig ? '✅' : '❌'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {joinedProjects.map(project => {
                                const hasConfig = projectsWithConfigs[project.id] || false;
                                return (
                                    <div 
                                        key={project.id} 
                                        className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedProject(project);
                                            if (activeSection === 'team') {
                                                loadTeamMembers();
                                            }
                                            if (activeSection === 'config-builder') {
                                                loadProjectSaves();
                                            }
                                        }}
                                    >
                                        <h4 className="project-title">
                                            {project.name}
                                        </h4>
                                        <p className="project-description">
                                            {project.description || 'Без описания'}
                                        </p>
                                        <div className="project-footer">
                                            <span className="project-badge member">
                                                Участник
                                            </span>
                                            <span className="project-config-status">
                                                {hasConfig ? '✅' : '❌'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
    
    const renderTeamSection = () => {
        if (!selectedProject) {
            return (
                <div className="team-content">
                    <div className="no-project-selected">
                        <p>Выберите проект чтобы управлять командой</p>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="team-content">
                <div className="selected-project-info">
                    <h3>Команда проекта: <span className="project-name">{selectedProject.name}</span></h3>
                </div>
                
                <div className="team-management">
                    <div className="add-member-section">
                        <form onSubmit={handleAddMember} className="member-form">
                            <div className="form-group">
                                <label>Добавить участника:</label>
                                <input 
                                    type="text" 
                                    value={memberUsername}
                                    onChange={(e) => setMemberUsername(e.target.value)}
                                    placeholder="Имя пользователя" 
                                    required 
                                    disabled={loading}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="submit-button"
                                style={{ textAlign: 'left', paddingLeft: '5px' }}
                            >
                                {loading ? '[Добавление...]' : '[Добавить в команду]'}
                            </button>
                        </form>
                    </div>
                    
                    <div className="members-list-section">
                        <h4>Участники команды</h4>
                        
                        <div className="members-list">
                            {members.length === 0 ? (
                                <p className="no-members">Нет участников в этом проекте</p>
                            ) : (
                                members.map(member => (
                                    <div key={member.id || member.username} className="member-item">
                                        <div className="member-info">
                                            <div className="member-username">{member.username}</div>
                                            <div className="member-role">Роль: {member.root || 'VIEWER'}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveMember(member.username)}
                                            disabled={loading}
                                            className="remove-button"
                                            style={{ padding: '2px 8px', fontSize: '0.9rem' }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderConfigBuilderSection = () => {
        return (
            <div className="config-builder-content">
                <div className="save-controls">
                    <div className="action-buttons">
                        <button 
                            onClick={handleDownloadConfig}
                            disabled={!areConfigsValid || loading}
                            className="download-button"
                            style={{ textAlign: 'left', paddingLeft: '5px' }}
                        >
                            {loading ? '[Загрузка...]' : '[Скачать]'}
                        </button>
                        
                        {selectedProject && (
                            <button 
                                onClick={handleSaveToProject}
                                disabled={!areConfigsValid || loading}
                                className="save-project-button"
                                style={{ textAlign: 'left', paddingLeft: '5px' }}
                            >
                                {loading ? '[Сохранение...]' : '[Сохранить в проект]'}
                            </button>
                        )}
                    </div>
                </div>
                
                {selectedProject && projectSaves.length > 0 && (
                    <div className="project-saves-section">
                        <h4>Сохраненные конфигурации проекта</h4>
                        
                        <div className="saves-list">
                            {projectSaves.map((save, index) => (
                                <div key={index} className="save-item">
                                    <span className="save-name">{save}</span>
                                    <button 
                                        onClick={() => handleDownloadFromProject(save)}
                                        disabled={loading}
                                        className="action-button"
                                        style={{ padding: '2px 8px', fontSize: '0.9rem' }}
                                    >
                                        Скачать
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <AppConfigBuilderPage 
                    onAppConfigChange={setAppConfig}
                    onEntityConfigChange={setEntityConfig}
                    onAppConfigValidationChange={(isValid) => setAppConfigValid(isValid)}
                    onEntityConfigValidationChange={(isValid) => setEntityConfigValid(isValid)}
                />
            </div>
        );
    };
    
    return (
        <div className="projects-page">
            <h2>Мои проекты</h2>
            
            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}
            
            {success && (
                <div className="success-message">
                    ✅ {success}
                </div>
            )}
            
            <div className="section-tabs">
                <button 
                    onClick={() => setActiveSection('projects')}
                    className={`section-tab ${activeSection === 'projects' ? 'active' : ''}`}
                >
                    Проекты
                </button>
                <button 
                    onClick={() => setActiveSection('team')}
                    className={`section-tab ${activeSection === 'team' ? 'active' : ''} ${!selectedProject ? 'disabled' : ''}`}
                    disabled={!selectedProject}
                >
                    Команда
                </button>
                <button 
                    onClick={() => setActiveSection('config-builder')}
                    className={`section-tab ${activeSection === 'config-builder' ? 'active' : ''}`}
                >
                    Конструктор
                </button>
            </div>
            
            {activeSection === 'projects' && renderProjectsSection()}
            {activeSection === 'team' && renderTeamSection()}
            {activeSection === 'config-builder' && renderConfigBuilderSection()}
        </div>
    );
};

export default ProjectsPage;