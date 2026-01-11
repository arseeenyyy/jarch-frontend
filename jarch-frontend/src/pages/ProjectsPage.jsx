import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const userProjects = await projectService.getUserProjects();
            setProjects(userProjects);
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            alert('Ошибка загрузки проектов: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await projectService.createProject({
                name: projectName,
                description: projectDescription,
                owner: 'current-user'
            });
            
            alert('Проект успешно создан!');
            setProjectName('');
            setProjectDescription('');
            loadProjects();
        } catch (error) {
            alert('Ошибка создания проекта: ' + error.message);
        }
    };

    const viewProject = (id) => {
        alert(`Просмотр проекта ID: ${id}`);
    };

    return (
        <div id="projects" className="tab-content active">
            <h2>📂 Мои проекты</h2>

            <div className="grid">
                <div className="card">
                    <h3>🆕 Создать проект</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Название проекта:</label>
                            <input 
                                type="text" 
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Введите название проекта" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание:</label>
                            <textarea 
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Описание проекта" 
                                rows="3"
                            />
                        </div>
                        <button type="submit">Создать проект</button>
                    </form>
                </div>

                <div className="card">
                    <h3>📋 Список проектов</h3>
                    <div className="project-list">
                        {projects.map(project => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                onView={viewProject}
                            />
                        ))}
                    </div>
                    <button onClick={loadProjects} className="secondary" style={{ marginTop: '10px' }}>
                        🔄 Обновить список
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;