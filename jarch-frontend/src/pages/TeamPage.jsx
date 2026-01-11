import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';

const TeamPage = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [members, setMembers] = useState([]);
    const [memberData, setMemberData] = useState({
        username: '',
        role: 'DEVELOPER',
        accessLevel: 'VIEWER'
    });

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadTeamMembers();
        }
    }, [selectedProject]);

    const loadProjects = async () => {
        try {
            const userProjects = await projectService.getUserProjects();
            setProjects(userProjects);
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
        }
    };

    const loadTeamMembers = async () => {
        try {
            const teamMembers = await teamService.getTeamMembers(selectedProject);
            setMembers(teamMembers);
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await teamService.addMember(selectedProject, {
                project: { id: selectedProject },
                ...memberData
            });
            
            setMemberData({
                username: '',
                role: 'DEVELOPER',
                accessLevel: 'VIEWER'
            });
            loadTeamMembers();
        } catch (error) {
            console.error('Ошибка добавления участника:', error);
        }
    };

    const handleMemberChange = (e) => {
        setMemberData({
            ...memberData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
            <h2>Управление командой</h2>

            <div>
                <div>
                    <h3>Добавить участника</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Проект:</label>
                            <select 
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                required
                            >
                                <option value="">Выберите проект</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Имя пользователя:</label>
                            <input 
                                type="text" 
                                name="username"
                                value={memberData.username}
                                onChange={handleMemberChange}
                                placeholder="Введите username" 
                                required 
                            />
                        </div>
                        <div>
                            <label>Роль:</label>
                            <select 
                                name="role"
                                value={memberData.role}
                                onChange={handleMemberChange}
                                required
                            >
                                <option value="DEVELOPER">Разработчик</option>
                                <option value="TESTER">Тестировщик</option>
                                <option value="DESIGNER">Дизайнер</option>
                                <option value="PRODUCT_OWNER">Product Owner</option>
                            </select>
                        </div>
                        <div>
                            <label>Уровень доступа:</label>
                            <select 
                                name="accessLevel"
                                value={memberData.accessLevel}
                                onChange={handleMemberChange}
                                required
                            >
                                <option value="VIEWER">Просмотр</option>
                                <option value="EDITOR">Редактирование</option>
                                <option value="ADMIN">Администратор</option>
                            </select>
                        </div>
                        <button type="submit" style={{
                                    display: "block",
                                    textAlign: "left",
                                    paddingLeft: "5px"
                        }}>
                                    [Добавить в команду]
                        </button>
                    </form>
                </div>

                <div>
                    <h3>Участники команды</h3>
                    <div>
                        <label>Выберите проект:</label>
                        <select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">Выберите проект</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        {members.map(member => (
                            <div key={member.id}>
                                <div>
                                    <strong>{member.username}</strong>
                                    <br />
                                    <small>Роль: {member.role} • Доступ: {member.accessLevel}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;