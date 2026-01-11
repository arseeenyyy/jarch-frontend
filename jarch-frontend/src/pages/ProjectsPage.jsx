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
            
            setProjectName('');
            setProjectDescription('');
            loadProjects();
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
        }
    };

    const viewProject = (id) => {
        console.log('Просмотр проекта ID:', id);
    };

    return (
        <div>
            <h2>Мои проекты</h2>

            <div>
                <div>
                    <h3>Создать проект</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Название проекта:</label>
                            <input 
                                type="text" 
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Введите название проекта" 
                                required 
                            />
                        </div>
                        <div>
                            <label>Описание:</label>
                            <textarea 
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Описание проекта" 
                                rows="3"
                            />
                        </div>
                            <button 
                                type="submit"
                                style={{
                                    display: "block",
                                    textAlign: "left",
                                    paddingLeft: "5px"
                                }}
                            >
                                [Создать проект]
                            </button>             
                    </form>
                </div>

                <div>
                    <h3>Список проектов</h3>
                    <div>
                        {projects.map(project => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                onView={viewProject}
                            />
                        ))}
                    </div>
                    <button style={{
                                    display: "block",
                                    textAlign: "left",
                                    paddingLeft: "5px"
                                }}
                            onClick={loadProjects}>
                        [обновить список]
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;