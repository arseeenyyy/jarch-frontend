import React, { useState, useEffect } from 'react';
import AppConfigBuilderPage from './AppConfigBuilderPage';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { saveService } from '../services/saveService';

const ProjectsPage = () => {
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [projectsWithConfigs, setProjectsWithConfigs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeSection, setActiveSection] = useState('projects');
    
    const [members, setMembers] = useState([]);
    const [memberUsername, setMemberUsername] = useState('');
    
    const [appConfig, setAppConfig] = useState(null);
    const [entityConfig, setEntityConfig] = useState(null);
    const [appConfigValid, setAppConfigValid] = useState(false);
    const [entityConfigValid, setEntityConfigValid] = useState(false);
    const [projectSaves, setProjectSaves] = useState([]);
    
    const areConfigsValid = appConfigValid && entityConfigValid;
    
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
            const filteredSaves = saves.filter(save => save && save.trim() !== '');
            setProjectSaves(filteredSaves);
            
            setProjectsWithConfigs(prev => ({
                ...prev,
                [selectedProject.id]: filteredSaves.length > 0
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
        
        const projectName = selectedProject.name;
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const formData = new FormData();
            formData.append('projectName', projectName);
            
            const appConfigBlob = new Blob([JSON.stringify(appConfig, null, 2)], { type: 'application/json' });
            const entityConfigBlob = new Blob([JSON.stringify(entityConfig, null, 2)], { type: 'application/json' });
            
            formData.append('appConfig', appConfigBlob, 'app-config.json');
            formData.append('entityConfig', entityConfigBlob, 'entity-config.json');
            
            await saveService.saveToProject(formData);
            
            setSuccess(`Конфигурации сохранены в проект "${selectedProject.name}"`);
            
            setProjectsWithConfigs(prev => ({
                ...prev,
                [selectedProject.id]: true
            }));
            
            await loadProjectSaves();
            
            setAppConfig(null);
            setEntityConfig(null);
            setAppConfigValid(false);
            setEntityConfigValid(false);
            
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
        
        const timestamp = new Date().toISOString().split('T')[0];
        const downloadName = `${fileName}_${timestamp}`;
        
        if (appConfig) {
            const appBlob = new Blob([JSON.stringify(appConfig, null, 2)], { 
                type: 'application/json' 
            });
            const appUrl = URL.createObjectURL(appBlob);
            const appLink = document.createElement('a');
            appLink.href = appUrl;
            appLink.download = `${downloadName}_app-config.json`;
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
                entityLink.download = `${downloadName}_entity-config.json`;
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
            const [entityConfigData, appConfigData] = await Promise.all([
                saveService.downloadProjectEntity(saveName),
                saveService.downloadProjectApp(saveName)
            ]);
            
            const entityBlob = new Blob([JSON.stringify(entityConfigData, null, 2)], { type: 'application/json' });
            const appBlob = new Blob([JSON.stringify(appConfigData, null, 2)], { type: 'application/json' });
            
            const entityUrl = URL.createObjectURL(entityBlob);
            const appUrl = URL.createObjectURL(appBlob);
            
            const entityLink = document.createElement('a');
            entityLink.href = entityUrl;
            entityLink.download = `${saveName}_entity-config.json`;
            
            const appLink = document.createElement('a');
            appLink.href = appUrl;
            appLink.download = `${saveName}_app-config.json`;
            
            entityLink.click();
            setTimeout(() => appLink.click(), 100);
            
            setTimeout(() => {
                URL.revokeObjectURL(entityUrl);
                URL.revokeObjectURL(appUrl);
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
                >
                    {showCreateForm ? '[Скрыть форму создания]' : '[Создать новый проект]'}
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
                        >
                            {loading ? '[Создание...]' : '[Создать проект]'}
                        </button>
                    </form>
                )}
            </div>
            
            <div className="projects-list-section">
                <h3>Мои проекты</h3>
                
                <div className="projects-grid">
                    {ownedProjects.length === 0 && joinedProjects.length === 0 ? (
                        <div className="no-projects">
                            У вас еще нет проектов. Создайте первый проект!
                        </div>
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
                                        }}
                                    >
                                        <div className="project-card-header">
                                            <h4 className="project-title">
                                                {project.name}
                                            </h4>
                                            <span className="project-badge owner">
                                                Владелец
                                            </span>
                                        </div>
                                        <p className="project-description">
                                            {project.description || 'Без описания'}
                                        </p>
                                        <div className="project-footer">
                                            <span className="project-config-status">
                                                {hasConfig ? '✅ Конфигурации' : '❌ Нет конфигураций'}
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
                                        }}
                                    >
                                        <div className="project-card-header">
                                            <h4 className="project-title">
                                                {project.name}
                                            </h4>
                                            <span className="project-badge member">
                                                Участник
                                            </span>
                                        </div>
                                        <p className="project-description">
                                            {project.description || 'Без описания'}
                                        </p>
                                        <div className="project-footer">
                                            <span className="project-config-status">
                                                {hasConfig ? '✅ Конфигурации' : '❌ Нет конфигураций'}
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
                        >
                            {loading ? '[Загрузка...]' : '[Скачать конфигурации]'}
                        </button>
                        
                        {selectedProject && (
                            <button 
                                onClick={handleSaveToProject}
                                disabled={!areConfigsValid || loading}
                                className="save-project-button"
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
                    onAppConfigValidationChange={setAppConfigValid}
                    onEntityConfigValidationChange={setEntityConfigValid}
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