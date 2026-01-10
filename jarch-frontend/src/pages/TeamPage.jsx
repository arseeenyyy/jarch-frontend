import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';
import TeamMember from '../components/TeamMember';

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
            
            alert('Участник успешно добавлен!');
            setMemberData({
                username: '',
                role: 'DEVELOPER',
                accessLevel: 'VIEWER'
            });
            loadTeamMembers();
        } catch (error) {
            alert('Ошибка добавления участника: ' + error.message);
        }
    };

    const handleMemberChange = (e) => {
        setMemberData({
            ...memberData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div id="team" className="tab-content active">
            <h2>👥 Управление командой</h2>

            <div className="grid">
                <div className="card">
                    <h3>➕ Добавить участника</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
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
                        <div className="form-group">
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
                        <div className="form-group">
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
                        <div className="form-group">
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
                        <button type="submit">Добавить в команду</button>
                    </form>
                </div>

                <div className="card">
                    <h3>👥 Участники команды</h3>
                    <div className="form-group">
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
                    <div id="teamMembersList">
                        {members.map(member => (
                            <TeamMember key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;