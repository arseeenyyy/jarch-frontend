import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const ProjectsPage = () => {
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [activeTab, setActiveTab] = useState('owned');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAllProjects();
    }, []);

    const loadAllProjects = async () => {
        setLoading(true);
        setError('');
        
        try {
            const userProjects = await projectService.getUserProjects();
            setOwnedProjects(userProjects);
            
            try {
                const joined = await projectService.getJoinedProjects();
                setJoinedProjects(joined);
            } catch (joinError) {
                console.warn('Не удалось загрузить проекты участника:', joinError);
                setJoinedProjects([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            setError('Ошибка загрузки проектов');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!projectName.trim()) {
            setError('Введите название проекта');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await projectService.createProject({
                name: projectName,
                description: projectDescription || '',
            });
            
            setProjectName('');
            setProjectDescription('');
            await loadAllProjects();
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
            setError('Ошибка создания проекта');
        } finally {
            setLoading(false);
        }
    };

    const projectsToShow = activeTab === 'owned' ? ownedProjects : joinedProjects;

    return (
        <div className="projects-page">
            <h2>Мои проекты</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="tabs">
                <button 
                    onClick={() => setActiveTab('owned')}
                    disabled={loading}
                    className={`tab-button ${activeTab === 'owned' ? 'active' : ''}`}
                >
                    Мои проекты ({ownedProjects.length})
                </button>
                <button 
                    onClick={() => setActiveTab('joined')}
                    disabled={loading}
                    className={`tab-button ${activeTab === 'joined' ? 'active' : ''}`}
                >
                    Участвую ({joinedProjects.length})
                </button>
            </div>

            <div className="projects-content">
                <div className="create-project-section">
                    <h3>Создать проект</h3>
                    <form onSubmit={handleSubmit} className="project-form">
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
                </div>

                <div className="projects-list-section">
                    <h3>
                        {activeTab === 'owned' ? 'Проекты, которыми я владею' : 'Проекты, в которых я участвую'}
                    </h3>
                    
                    <div className="refresh-section">
                        <button 
                            onClick={loadAllProjects}
                            disabled={loading}
                            className="refresh-button"
                        >
                            [Обновить список]
                        </button>
                    </div>
                    
                    <div className="projects-list">
                        {projectsToShow.length === 0 ? (
                            <p className="no-projects">
                                {activeTab === 'owned' 
                                    ? 'У вас еще нет собственных проектов' 
                                    : 'Вы не участвуете в чужих проектах'}
                            </p>
                        ) : (
                            projectsToShow.map(project => (
                                <div key={project.id} className="project-card">
                                    <h4 className="project-title">
                                        {project.name}
                                        {activeTab === 'joined' && (
                                            <small className="project-owner">
                                                Владелец: {project.owner}
                                            </small>
                                        )}
                                    </h4>
                                    <p className="project-description">
                                        {project.description || 'Без описания'}
                                    </p>
                                    <div className="project-footer">
                                        <span className={`project-badge ${activeTab === 'owned' ? 'owner' : 'member'}`}>
                                            {activeTab === 'owned' ? 'Владелец' : 'Участник'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;